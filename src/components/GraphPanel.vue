<template>
  <div
    class="graph-card"
    :class="[
      { 'fill-height': fillHeight },
      isDark ? 'dark-mode' : 'light-mode',
    ]"
  >
    <h3 class="graph-title">
      {{ graphTitle }}
    </h3>

    <div class="canvas-wrap">
      <div v-if="!lastTransformed || !lastTransformed.values?.length" class="no-data">
        <p>📊 데이터 로드 중...</p>
      </div>
      <canvas v-else ref="chartRef" style="width: 100%; height: 100%" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTheme } from 'vuetify'
import { Chart, registerables } from 'chart.js'
import axiosIns from '@/plugins/axios'
import { useShipStore } from '@/stores/shipStore'
import { getFlowData } from '@/api/flow'

const props = defineProps({
  tankId: { type: String, required: true },
  type: { type: String, required: true }, // 'accumulated' | 'hourly'
  fillHeight: { type: Boolean, default: false },
  interval: { type: String, default: '1h' },
  from: { type: String, default: 'detail' },
  refresh: Number,
  measurement: { type: String, default: '' },
})

Chart.register(...registerables)

const isDetail = computed(() => props.from === 'detail')

const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)
const graphTitle = computed(() => (props.type === 'accumulated' ? '누적 주수량' : '시간별 주수량'))

const loading = ref(false)
const chartRef = ref(null)
let chartInstance = null
let lastTransformed = null
let ro = null

// ✅ KST 자정 자동 새로고침 타이머
let dailyRefreshTimeout = null
let dailyRefreshInterval = null

const shipStore = useShipStore()

const tankInfo = computed(() => {
  const ship = shipStore.shipList.find(s => s.name === shipStore.selectedShip)
  return ship?.tank.find(t => t.name === props.tankId) || null
})

const shipNo = computed(() => shipStore.selectedShip ?? '')

const isUTC = false

const formatTimeKST = (input, isDashboard = false) => {
  const date = new Date(input)
  if (isDashboard) {
    return date.toLocaleString('ko-KR', {
      hour12: false, timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit',
    }).replace(',', '')
  }
  return date.toLocaleString('ko-KR', {
    hour12: false, timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).replace(',', '')
}

const formatTimeUTC = (input, isDashboard = false) => {
  const date = new Date(input)
  if (isDashboard) return date.toISOString().slice(11, 16)
  return date.toISOString().slice(5, 16).replace('T', ' ')
}

const computeMaxPoints = () => {
  if (props.from === 'dashboard') return Number.MAX_SAFE_INTEGER
  const isMobile = window.innerWidth <= 750
  if (isDetail.value && isMobile) return 30
  return isMobile ? 40 : 100
}

const downsampleTriple = (labels, values, goals, maxPoints = 200) => {
  const total = labels.length
  if (total <= maxPoints) return { labels, values, goals }
  const step = Math.floor(total / maxPoints)
  const newLabels = []
  const newValues = []
  const newGoals = []
  for (let i = 0; i < total; i += step) {
    newLabels.push(labels[i])
    newValues.push(values[i])
    newGoals.push(goals[i])
  }
  return { labels: newLabels, values: newValues, goals: newGoals }
}

// ✅ 요청 캐시 & TTL
const queryCache = new Map()
const cacheTTLms = 30_000
const ttlTimers = new Map()
function makeCacheKey(url, params) {
  const sorted = Object.fromEntries(Object.entries(params || {}).sort(([a],[b]) => a.localeCompare(b)))
  return `${url}?${JSON.stringify(sorted)}`
}
function setCache(key, promise) {
  queryCache.set(key, promise)
  if (ttlTimers.has(key)) clearTimeout(ttlTimers.get(key))

  const t = setTimeout(() => {
    queryCache.delete(key)
    ttlTimers.delete(key)
  }, cacheTTLms)

  ttlTimers.set(key, t)
}

let currentController = null

const kstDayRangeISO = () => {
  const tz = 'Asia/Seoul'

  const getKstYmd = () => {
    const now = new Date()
    return now.toLocaleString('sv-SE', { timeZone: tz }).slice(0, 10)
  }

  const ymd =  getKstYmd()

  const startKst = new Date(`${ymd}T00:00:00+09:00`)
  const endKst   = new Date(`${ymd}T23:59:59.999+09:00`)

  return {
    startISO: startKst.toISOString(),
    endISO: endKst.toISOString(),
  }
}

/* =========================================================
   변환 로직
   - accumulated: 소스별 시간버킷 마지막값 → 합산(A+B)
   - hourly     : (버킷별 A+B 총합)의 연속 차분 → 시간별(A+B)
   ========================================================= */
// eslint-disable-next-line sonarjs/cognitive-complexity
const processData = (rawData) => {
  const rows = (rawData || []).filter(
    r => r.time && !isNaN(new Date(r.time)) && !isNaN(Number(r.value))
  )

  const bucketKey = (isoString) => {
    if (props.from !== 'dashboard') return isoString
    const d = new Date(isoString)
    const h = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours())
    return h.toISOString()
  }

  const formatTime = (time) => (
    isUTC ? formatTimeUTC(time, props.from === 'dashboard')
      : formatTimeKST(time, props.from === 'dashboard')
  )

  const MAX_POINTS = computeMaxPoints()

  // ---- 소스 키 강화 (충돌 방지)
  const srcOf = (r) => {
    const u = r.device_uuid ?? r.uuid ?? r.device ?? ''
    const m = r.measurement ?? r.meas ?? r.src ?? ''
    const s = r.source ?? r.series ?? r.src_index ?? ''
    const t = r.tank_name ?? r.tank ?? ''
    const k = [u, m, s, t].filter(Boolean).join('|')
    return k || 'src'
  }

  if (props.type === 'accumulated') {
    const lastBySrcBucket = new Map()
    for (const r of rows) {
      const src = srcOf(r)
      const bk  = bucketKey(r.time)
      const tMs = new Date(r.time).getTime()
      if (!lastBySrcBucket.has(src)) lastBySrcBucket.set(src, new Map())
      const m = lastBySrcBucket.get(src)
      const prev = m.get(bk)
      if (!prev || tMs > prev.t) {
        m.set(bk, {
          t: tMs,
          v: Number(Number(r.value)?.toFixed(3)),
          g: (r.goal ?? r.accumulationSetting ?? r.accumulation_setting),
        })
      }
    }

    const allBuckets = new Set()
    for (const m of lastBySrcBucket.values()) for (const k of m.keys()) allBuckets.add(k)
    const sortedBuckets = Array.from(allBuckets).sort()

    const labels = []
    const values = []
    const goals  = []

    for (const bk of sortedBuckets) {
      let sumV = 0
      let sumG = 0
      for (const m of lastBySrcBucket.values()) {
        const rec = m.get(bk)
        if (!rec) continue
        sumV += rec.v

        const gRaw = rec.g
        if (gRaw != null && !Number.isNaN(Number(gRaw))) sumG += Number(Number(gRaw).toFixed(3))
      }
      labels.push(formatTime(bk))
      values.push(Number(sumV?.toFixed(3)))
      goals.push(Number(sumG?.toFixed(3)))
    }

    return downsampleTriple(labels, values, goals, MAX_POINTS)
  }

  if (props.type === 'hourly') {
    const lastBySrcBucket = new Map() // src -> Map(bk -> {t, v})
    for (const r of rows) {
      const src = srcOf(r)
      const bk  = bucketKey(r.time)
      const tMs = new Date(r.time).getTime()
      if (!lastBySrcBucket.has(src)) lastBySrcBucket.set(src, new Map())
      const m = lastBySrcBucket.get(src)
      const prev = m.get(bk)
      if (!prev || tMs > prev.t) {
        m.set(bk, { t: tMs, v: Number(Number(r.value)?.toFixed(3)) })
      }
    }

    const bucketSet = new Set()
    for (const m of lastBySrcBucket.values()) for (const k of m.keys()) bucketSet.add(k)
    const sortedBuckets = Array.from(bucketSet).sort()

    const bucketSums = [] // [bk, sumV]
    for (const bk of sortedBuckets) {
      let sumV = 0
      for (const m of lastBySrcBucket.values()) {
        const rec = m.get(bk)
        if (rec) sumV += rec.v
      }
      bucketSums.push([bk, Number(sumV?.toFixed(3))])
    }

    const labels = []
    const values = []
    let prevSum = null
    for (const [bk, sumV] of bucketSums) {
      const diff = (prevSum == null) ? 0 : (sumV - prevSum)

      labels.push(formatTime(bk))
      values.push(Number((diff < 0 ? 0 : diff)?.toFixed(3)))
      prevSum = sumV
    }

    return downsampleTriple(labels, values, [], MAX_POINTS)
  }

  return { labels: [], values: [], goals: [] }
}

/* =========================================================
   데이터 fetch + 렌더
   - ⏰ detail이 아니면 KST 자정~23:59:59.999 범위(start/end) 전달
   ========================================================= */
// eslint-disable-next-line sonarjs/cognitive-complexity
const fetchDataAndRender = async () => {

  if (!tankInfo.value || !shipNo.value) {
    console.warn('그래프 데이터 부족: tankInfo 또는 shipNo 없음')
    return
  }

  try {
    if (isDetail.value) {
      loading.value = true
      await nextTick()
      await new Promise(requestAnimationFrame)
    }

    const rawSources = Array.isArray(tankInfo.value?.sources) ? tankInfo.value.sources : []

    const measurements = rawSources
      .map(s => (typeof s === 'string' ? s : (s?.measurement ?? s?.name ?? s?.id ?? '')))
      .filter(Boolean)

    const uuids = rawSources
      .map(s => (typeof s === 'string' ? '' : (s?.device_uuid ?? s?.uuid ?? '')))
      .filter(Boolean)

    const params = {
      unit: props.interval,
      shipNo: shipNo.value,
      tankName: tankInfo.value.name,
    }

    if (measurements.length) {
      params.measurements = measurements.join(',')
      if (!props.measurement) params.measurement = measurements[0]
    } else if (props.measurement) {
      params.measurement = props.measurement
    }

    // ✅ UUID 기반 조회 유지
    if (uuids.length > 1) {
      params.deviceUuids = uuids.join(',')
    } else if (uuids.length === 1) {
      params.deviceUuid = uuids[0]
    } else if (tankInfo.value?.uuid) {
      params.deviceUuid = tankInfo.value.uuid
    } else if (shipStore.selectedDeviceUuid) {
      params.deviceUuid = shipStore.selectedDeviceUuid
    }

    if (!isDetail.value) {
      const { startISO, endISO } = kstDayRangeISO()

      params.start = startISO
      params.end   = endISO
    }

    const url = '/flow/data'
    const key = makeCacheKey(url, params)

    if (currentController) currentController.abort()
    currentController = new AbortController()

    let p = queryCache.get(key)
    if (!p) {
      p = await getFlowData(params, { signal: currentController.signal })

      /*
      p = axiosIns.get(url, {
        params,
        paramsSerializer: prms => new URLSearchParams(prms).toString(),
        signal: currentController.signal,
      })
      */
      setCache(key, p)
    }

    const res = await p
    console.log('[GraphPanel] 그래프 데이터 받음:', props.type, res)
    const transformed = processData(res)
    
    lastTransformed = transformed
    renderChart(transformed)

  } catch (err) {
    if (err?.name === 'CanceledError' || err?.name === 'AbortError') return
    console.error('[GraphPanel] 그래프 API 실패:', props.type, err)
  } finally {
    if (isDetail.value) loading.value = false
  }
}

// eslint-disable-next-line sonarjs/cognitive-complexity
const renderChart = ({ labels, values, goals }) => {
  if (!chartRef.value || !values.length) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }
    return
  }
  const ctx = chartRef.value.getContext('2d')
  if (chartInstance) chartInstance.destroy()

  const tickColor = isDark.value ? 'white' : 'black'
  const gridColor = isDark.value ? '#666' : '#ccc'
  const isAccumulated = props.type === 'accumulated'

  const isMobile = window.innerWidth <= 750
  const desiredMax = isMobile ? 4 : 20
  const isDetail = props.from === 'detail'

  const useDetailStyle = isDetail && !isMobile 

  const xTickColor = useDetailStyle ? '#404040' : tickColor
  
  const xFontSize = useDetailStyle 
    ? 20 
    : (isMobile ? Math.max(8, Math.floor(window.innerWidth / 40)) : 14)

  const xFontWeight = useDetailStyle ? 'bold' : 'normal'

  const step = Math.max(1, Math.ceil(labels.length / desiredMax))

  const datasets = isAccumulated
    ? [
      {
        label: '실제 주수량',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointHoverBorderWidth: 3,
      },
      {
        label: '목표 주수량',
        data: goals,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderColor: 'rgba(139, 92, 246, 0.8)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: true,
        pointRadius: 0,
        tension: 0,
        stepped: 'before',
      },
    ]
    : [
      {
        label: '시간별 주수량',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(37, 99, 235, 0.9)',
        hoverBorderColor: 'rgba(29, 78, 216, 1)',
      },
    ]

  chartInstance = new Chart(ctx, {
    type: isAccumulated ? 'line' : 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      layout: { padding: { right: 10, top: 5, bottom: 5 } },
      plugins: {
        legend: {
          position: isMobile ? 'top' : 'right',
          align: 'center',
          labels: { 
            color: tickColor, 
            boxHeight: 12,
            font: {
              size: 12,
              weight: '600',
            },
            padding: 12,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: isDark.value ? 'rgba(15, 23, 42, 0.9)' : 'rgba(31, 41, 55, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: isDark.value ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)',
          borderWidth: 1,
          padding: 12,
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 12 },
          displayColors: true,
          boxPadding: 8,
          cornerRadius: 6,
          callbacks: {
            label: (c) => `${c.dataset.label}: ${c.parsed.y} m³`,
            afterLabel: (c) => {
              if (isAccumulated && c.datasetIndex === 1) {
                return `목표값: ${c.parsed.y} m³`
              }
              return ''
            },
          },
        },
        datalabels: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: xTickColor,
            maxTicksLimit: desiredMax,
            maxRotation: 0,
            minRotation: 0,
            font: {
              size: xFontSize,
              weight: xFontWeight,
            },
            callback: function (value, index) {
              if (index % step !== 0) return ''

              const rawLabel = this.getLabelForValue(value)

              if (!isDetail) return rawLabel

              const match = rawLabel.match(/(\d+)\.\s*(\d+)\.\s*(\d+):(\d+)/)
              
              if (!match) return rawLabel

              const [_, m, d, hh, mm] = match
              const datePart = `${m}/${d}`
              const timePart = `${hh}:${mm}`

              let showDate = false
              if (index === 0) {
                showDate = true
              } else {
                const prevIndex = index - step
                if (prevIndex >= 0 && labels[prevIndex]) {
                  const prevLabel = labels[prevIndex]
                  const prevMatch = prevLabel.match(/(\d+)\.\s*(\d+)\./)
                  if (prevMatch) {
                    const prevDatePart = `${prevMatch[1]}/${prevMatch[2]}`
                    if (prevDatePart !== datePart) showDate = true
                  } else {
                    showDate = true
                  }
                } else {
                  showDate = true
                }
              }

              // 날짜가 다를 때만 배열로 반환하여 줄바꿈 처리
              return showDate ? [datePart, timePart] : timePart
            },
          },
          grid: { color: gridColor },
        },
        y: {
          ticks: {
            color: tickColor,
            font: {
              size: isMobile ? Math.max(8, Math.floor(window.innerWidth / 40)) : 14,
            },
            callback: (v) => `${v} m³`,
          },
          grid: { color: gridColor },
          beginAtZero: true,
        },
      },
    },
  })
}

// ✅ 리사이즈/다크모드 재렌더 rAF 스로틀
let rafId = 0

const rerenderThrottled = () => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rafId = 0
    if (lastTransformed) renderChart(lastTransformed)
  })
}

const handleResize = () => { rerenderThrottled() }

const msUntilNextKST0000 = () => {
  const nowUtcMs = Date.now()
  const kstNow = new Date(nowUtcMs + 9 * 60 * 60 * 1000)
  const y = kstNow.getUTCFullYear()
  const m = kstNow.getUTCMonth()
  const d = kstNow.getUTCDate()

  // 다음날 00:00 KST == Date.UTC(y, m, d+1, -9, 0, 0, 0)

  // UTC로 모든것을 계산한 뒤에 Display만 하도록... 상위단부터 변경필요. ToDo_251217_HJS
  const nextMidnightUtcMs = Date.UTC(y, m, d + 1, -9, 0, 0, 0)
  return Math.max(0, nextMidnightUtcMs - nowUtcMs)
}

const scheduleDailyRefreshAtKST0000 = () => {
  const delay = msUntilNextKST0000()

  dailyRefreshTimeout = setTimeout(() => {
    // 1) 자정 트리거 시 즉시 갱신
    fetchDataAndRender()

    // 2) 이후 24시간 간격 고정
    dailyRefreshInterval = setInterval(() => {
      fetchDataAndRender()
    }, 24 * 60 * 60 * 1000)
  }, delay)
}

const clearDailyRefreshTimers = () => {
  if (dailyRefreshTimeout) {
    clearTimeout(dailyRefreshTimeout)
    dailyRefreshTimeout = null
  }
  if (dailyRefreshInterval) {
    clearInterval(dailyRefreshInterval)
    dailyRefreshInterval = null
  }
}

onMounted(() => {
  fetchDataAndRender()
  ro = new ResizeObserver(() => { rerenderThrottled() })

  const host = chartRef.value?.closest('.graph-card')
  if (host) ro.observe(host)
  window.addEventListener('resize', handleResize)

  // ✅ 자세한 페이지(detailInfo)에서만 자정 자동 새로고침
  if (isDetail.value) {
    scheduleDailyRefreshAtKST0000()
  }
})

onUnmounted(() => {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  if (ro) { ro.disconnect(); ro = null }
  window.removeEventListener('resize', handleResize)
  if (currentController) currentController.abort()

  // ✅ 타이머 정리
  clearDailyRefreshTimers()
})

watch(
  () => [props.tankId, props.date, props.type, tankInfo.value],
  () => {
    // tankInfo가 유효해진 경우에만 로직 실행
    if (tankInfo.value) {
      fetchDataAndRender()
    }
  },
  { deep: true }
)

watch(isDark, () => rerenderThrottled())
if (props.refresh !== undefined) {
  watch(() => props.refresh, () => { fetchDataAndRender() })
}

// measurement/uuid 변경 시 재조회 (detailInfo에서만 주로 사용)
watch(() => [props.measurement, tankInfo.value?.uuid, shipStore.selectedDeviceUuid], () => {
  if (!isDetail.value) return
  lastTransformed = null
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  fetchDataAndRender()
})
</script>

<style scoped>
.graph-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 12px;
  height: 100%;
  min-height: 250px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.graph-card.fill-height { 
  height: 100% !important; 
}

.graph-card.light-mode {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #222;
  border-color: #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.graph-card.dark-mode {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: #e2e8f0;
  border-color: #4b5563;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.graph-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.graph-card.dark-mode:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.graph-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.graph-title::before {
  content: '📊';
  font-size: 16px;
}

.graph-card.light-mode .graph-title {
  color: #1f2937;
}

.graph-card.dark-mode .graph-title {
  color: #f0f4f8;
}

/* 캔버스 래퍼 */
.canvas-wrap {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 200px;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 8px;
  padding: 8px;
}

.graph-card.dark-mode .canvas-wrap {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* 데이터 없음 메시지 */
.no-data {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.graph-card.light-mode .no-data {
  color: #9ca3af;
}

.graph-card.dark-mode .no-data {
  color: #6b7280;
}

@media (max-width: 750px) {
  .graph-card { 
    min-height: 220px;
    padding: 12px;
  }
  .canvas-wrap { 
    min-height: 180px;
  }
  .graph-title {
    font-size: 13px;
    margin-bottom: 10px;
  }
}
</style>
