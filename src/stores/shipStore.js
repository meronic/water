// src/stores/shipStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import dayjs from 'dayjs'
import axiosIns from '@/plugins/axios'
import { getFlowStatus } from '@/api/flow'
import { getWebSettings } from '@/api/setting'
import { getModuleList } from '@/api/module'

export const useShipStore = defineStore('shipStore', () => {
  // =========================
  // State
  // =========================
  const shipList = ref([])
  const selectedShip = ref('')

  // 시스템 설정
  const noReceiptSec = ref(180)
  const settingsLoaded = ref(false)
  let settingsPromise = null

  // =========================
  // Utils
  // =========================
  const keyOf = (ship, tank) => `${ship}|||${tank}`
  const ts = () => dayjs().format('HH:mm:ss.SSS')
  const dbg = (...a) => console.debug('[shipStore]', ...a)

  const formatKST = (value) => {
    const date = (typeof value === 'string' || typeof value === 'number') ? new Date(value) : value
    try {
      const parts = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      }).formatToParts(date)
      const get = (t) => parts.find(p => p.type === t)?.value ?? ''
      return `${get('year')}/${get('month')}/${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
    } catch {
      const d = (n) => String(n).padStart(2, '0')
      return `${date.getFullYear()}/${d(date.getMonth()+1)}/${d(date.getDate())} ${d(date.getHours())}:${d(date.getMinutes())}:${d(date.getSeconds())}`
    }
  }

  const toMs = (raw, fallbackNow = true) => {
    if (raw == null) return fallbackNow ? Date.now() : 0
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string') {
      const s = raw.trim()
      if (/^\d+$/.test(s)) { const n = Number(s); return s.length === 10 ? n * 1000 : n }
      const t = Date.parse(s.replace(/\//g, '-').replace(' ', 'T'))
      if (!Number.isNaN(t)) return t
    }
    return fallbackNow ? Date.now() : 0
  }

  const ACC_EPS = 1e-4
  
  const calcReceiveFromActual = (tank) => {
    const now = Date.now()
    const TH = noReceiptSec.value * 1000
    
    const lastContact = tank.updatedAt || tank.changedAt 
    
    if (!lastContact) return '미수신'
    return (now - lastContact) < TH ? '수신' : '미수신'
  }

  const findTank = (shipName, tankName) => {
    const ship = shipList.value.find(s => s.name === shipName)
    return ship?.tank.find(t => t.name === tankName)

  }

  // =========================
  // module_tb → shipList 초기화 (동일 탱크명 병합)
  // =========================
  function setShipListFromModuleTb(modules) {
    const grouped = {}
    modules.forEach(m => {
      const ship = m.shipNo ?? m.ship_no
      const tank = m.tankName ?? m.tank_name
      if (!ship || !tank) return

      const branch = (m.moduleBranch ?? m.module_branch ?? '').toString().toUpperCase() || ''
      const deviceUuid = m.deviceUuid ?? m.device_uuid ?? null

      if (!grouped[ship]) grouped[ship] = {}
      if (!grouped[ship][tank]) grouped[ship][tank] = { count: 0, sources: [] }

      grouped[ship][tank].count += 1
      grouped[ship][tank].sources.push({ branch, device_uuid: deviceUuid })
    })

    shipList.value = Object.entries(grouped).map(([shipNo, tanksMap]) => {
      const tank = Object.entries(tanksMap)
        .map(([tankName, info]) => ([ tankName, info ]))
        .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
        .map(([tankName, info]) => ({
          name: tankName,
          goal: 0, actual: 0, flow: 0,
          lastTime: '-', receive: '미수신',
          changedAt: 0, updatedAt: 0, lastActual: null,
          sourcesCount: info.count, merge: info.count > 1,
          sources: info.sources,
        }))
      return { name: shipNo, tank }
    })
  }

  // === 설정 로드 보장 ===
  async function ensureSettingsLoaded() {
    if (settingsLoaded.value) return
    if (!settingsPromise) settingsPromise = fetchSettings().finally(() => { settingsPromise = null })
    await settingsPromise
  }

  async function fetchAndInitShipList() {
    try {
      await ensureSettingsLoaded()
      const data = await getModuleList()
      
      // 🔧 undefined 체크
      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ fetchAndInitShipList: 모듈 데이터 없음, 빈 목록 사용')
        return
      }
      
      const converted = data.map(m => ({
        shipNo: m.ship_no ?? m.shipNo,
        tankName: m.tank_name ?? m.tankName,
        moduleBranch: m.module_branch ?? m.moduleBranch ?? '',
        deviceUuid: m.device_uuid ?? m.deviceUuid ?? null,
        del_flag: m.del_flag ?? m.delFlag ?? 2,
      }))
      setShipListFromModuleTb(converted)
    } catch (err) {
      console.error('shipList 초기화 실패:', err)
    }
  }

  // =========================
  // 실시간 동기화 (합산)
  // =========================
  async function syncLatestTankDataFromApi(shipName) {
    try {
      dbg('[SYNC]', ts(), 'begin', shipName)
      await ensureSettingsLoaded()

      const data = await getFlowStatus({ shipNo: shipName })

      const ship = shipList.value.find(s => s.name === shipName)
      if (!ship) return

      // 🔧 undefined 체크
      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ syncLatestTankDataFromApi: 유량 데이터 없음')
        return
      }

      const aggMap = new Map()
      data.forEach(row => {
        const tName = row.tankName ?? row.tank_name
        if (!tName) return
        const goal = Number(row.accumulationSetting ?? row.accumulation_setting ?? row.goal ?? 0) || 0
        const actual = Number(row.currentAccumulation ?? row.current_accumulation ?? row.actual ?? 0) || 0
        const flow = Number(row.flowRate ?? row.flow_rate ?? 0) || 0
        const serverMs = toMs(row.time ?? row.timestamp ?? row.ts, false)

        const prev = aggMap.get(tName) || { goal: 0, actual: 0, flow: 0, serverMsMax: 0 }
        aggMap.set(tName, {
          goal: prev.goal + goal,
          actual: prev.actual + actual,
          flow: prev.flow + flow,
          serverMsMax: Math.max(prev.serverMsMax, serverMs || 0),
        })
      })

      for (const t of ship.tank) {
        const agg = aggMap.get(t.name)
        if (!agg) continue
        const newActual = Number(agg.actual) || 0
        const prev = t.lastActual
        const isFirst = prev == null
        const delta = isFirst ? Number.POSITIVE_INFINITY : (newActual - Number(prev))

        t.goal = Number(agg.goal) || 0
        t.actual = newActual
        t.flow = Math.floor(Number(agg.flow) || 0)
        if (agg.serverMsMax) {
          t.lastTime = formatKST(agg.serverMsMax)
          t.updatedAt = agg.serverMsMax
        }
        if (Math.abs(delta) > ACC_EPS) {
          t.changedAt = agg.serverMsMax || Date.now()
          t.lastActual = newActual
        } else if (isFirst) {
          t.changedAt = agg.serverMsMax || Date.now()
          t.lastActual = newActual
        }
        t.receive = calcReceiveFromActual(t)
      }

      dbg('[SYNC]', ts(), 'done', shipName)
    } catch (e) {
      console.warn('탱크 상태 동기화 실패 (Mock 모드 사용):', e)
    }
  }

  async function refreshReceiveStatus(shipName) {
    await ensureSettingsLoaded()
    const ship = shipList.value.find(s => s.name === shipName)
    if (!ship) return
    ship.tank.forEach(t => { t.receive = calcReceiveFromActual(t) })
  }

  async function fetchSettings() {
    try {
      const settings = await getWebSettings()
      
      // 🔧 undefined 체크
      if (!settings) {
        console.warn('⚠️ fetchSettings: 설정 데이터 없음, 기본값 사용')
        settingsLoaded.value = true
        return
      }

      const pickSeconds = (v) => {
        if (v == null) return null
        if (typeof v === 'number') return v
        if (typeof v === 'string') { const m = v.match(/[\d.]+/); return m ? Number(m[0]) : null }
        return null
      }
      
      let seconds = null
      if (Array.isArray(settings)) {
        const row = settings.find(r => {
          const k = String(r.key ?? r.settingKey ?? r.name ?? '').trim().toLowerCase()
          return ['noreceipt', 'no_receipt', 'noreceiptsec'].includes(k)
        })
        seconds = pickSeconds(row?.value ?? row?.settingValue ?? row?.val)
      } else if (settings && typeof settings === 'object') {
        // Mock 데이터 또는 직접 객체 형식
        seconds = pickSeconds(settings.noReceipt ?? settings.no_receipt ?? settings.noReceiptSec)
      }
      
      if (seconds && Number.isFinite(seconds) && seconds > 0) {
        noReceiptSec.value = seconds
      }
      settingsLoaded.value = true
    } catch (err) {
      console.error('설정 불러오기 실패:', err)
      settingsLoaded.value = true
    }
  }

  // =========================
  // ★ 전역 백그라운드 엔진 (어느 페이지든 동작)
  //  - 알림 기능 제거: 여기서는 상태 동기화만 수행
  // =========================
  const engine = ref({ timerId: null, running: false })
  const ENGINE_INTERVAL_SEC = 15        // 탭 활성 시 주기(초)
  const ENGINE_INTERVAL_BG_SEC = 45     // 비활성 시 완화 주기(초)
  // let engineTickBusy = false

  // async function engineTick() {
  //   if (engineTickBusy) return
  //   engineTickBusy = true
  //   try {
  //     await ensureSettingsLoaded()
  //     if (!shipList.value.length) {
  //       await fetchAndInitShipList()
  //     }
  //     for (const s of shipList.value) {
  //       await syncLatestTankDataFromApi(s.name)
  //     }
  //   } catch (e) {
  //     console.error('[engineTick] fail:', e)
  //   } finally {
  //     engineTickBusy = false
  //   }
  // }

  // function setEngineIntervalByVisibility() {
  //   const sec = (typeof document !== 'undefined' && document.visibilityState === 'visible')
  //     ? ENGINE_INTERVAL_SEC
  //     : ENGINE_INTERVAL_BG_SEC
  //   if (engine.value.timerId) clearInterval(engine.value.timerId)
  //   engine.value.timerId = setInterval(engineTick, sec * 1000)
  // }

  // function startBackgroundEngine() {
  //   if (engine.value.running) return
  //   engine.value.running = true
  //   // 첫 틱 즉시
  //   engineTick()
  //   // 가시성에 따라 주기 조절
  //   if (typeof document !== 'undefined') {
  //     document.addEventListener('visibilitychange', setEngineIntervalByVisibility)
  //   }
  //   setEngineIntervalByVisibility()
  //   console.log('[shipStore] background engine started')
  // }

  // function stopBackgroundEngine() {
  //   if (!engine.value.running) return
  //   engine.value.running = false
  //   if (engine.value.timerId) clearInterval(engine.value.timerId)
  //   engine.value.timerId = null
  //   if (typeof document !== 'undefined') {
  //     document.removeEventListener('visibilitychange', setEngineIntervalByVisibility)
  //   }
  //   console.log('[shipStore] background engine stopped')
  // }

  // =========================
  // Return
  // =========================
  return {
    shipList,
    selectedShip,

    findTank,
    setShipListFromModuleTb,
    formatKST,
    toMs,

    fetchAndInitShipList,
    syncLatestTankDataFromApi,
    refreshReceiveStatus,

    noReceiptSec,
    fetchSettings,
    ensureSettingsLoaded,

    // 전역 엔진 공개 (알림 X)
    // startBackgroundEngine,
    // stopBackgroundEngine,
  }
})
