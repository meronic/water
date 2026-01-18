<template>
  <div class="dashboard-wrapper" :class="[isDark ? 'dark-mode' : 'light-mode']">
    <div class="header">
      <label>호선 선택 :&nbsp;</label>
      <select v-model="shipStore.selectedShip" class="ship-select">
        <option disabled value="">호선 선택</option>
        <!-- ✅ 대시보드에서는 del_flag=0인 호선만 -->
        <option
          v-for="ship in dashboardShipList"
          :key="ship.name"
          :value="ship.name"
        >
          {{ ship.name }}
        </option>
      </select>
    </div>

    <div class="main-layout" v-if="selectedTankList.length">
      <div class="tank-status-board">
        <TankStatusBoard
          v-for="tank in selectedTankList"
          :key="tank.name"
          :tank-id="tank.name"
          :devices="(deviceRowsByShip[shipStore.selectedShip] || []).filter(d => d.tank === tank.name)"
          class="tank-card-instance"
        />
      </div>
    </div>

    <div class="events-section" v-if="eventData && eventData.length">
      <TankEventTable
        :events="eventData || []"
        caller="dashboard"
      />
    </div>
  </div>
</template>

<script setup>
import axiosIns from '@/plugins/axios'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import TankStatusBoard from '@/components/TankStatusBoard_v2.vue'
import TankEventTable from '@/components/TankEventTable.vue'
import { useShipStore } from '@/stores/shipStore'
import { getActiveModulesByShip  } from '@/api/module'
import { getEventList } from '@/api/event'

const { global: theme } = useTheme()
const isDark = computed(() => theme.name.value === 'dark')

const shipStore = useShipStore()
const eventData = ref([])

/** =========================
 *  대시보드 전용: del_flag===0 필터
 *  =========================
 *  /module/list 에서 del_flag===0 인 (ship, tank)만 모아
 *  activeTanksByShip = { [ship]: Set([tank, ...]) } 형태로 유지
 */
const activeTanksByShip = ref({})  // { [shipName]: Set([...tankNames]) }
const activeShipNames = computed(() => Object.keys(activeTanksByShip.value || {}))

async function loadActiveModules() {
  try {
    activeTanksByShip.value = await getActiveModulesByShip()
  } catch (e) {
    console.warn('활성 모듈 불러오기 실패 (Mock 모드 사용):', e)
    // Mock 모드에서는 기본값으로 대시보드 표시
    activeTanksByShip.value = {}
  }
}

/** 호선 드롭다운: 스토어의 전체 shipList 중 active만 노출 */
const dashboardShipList = computed(() =>
  shipStore.shipList.filter(s => activeShipNames.value.includes(s.name))
)

/** 선택된 호선의 탱크 목록: active만 노출 */
const selectedTankList = computed(() => {
  const shipName = shipStore.selectedShip
  const ship = shipStore.shipList.find(s => s.name === shipName)
  if (!ship) return []
  const activeSet = activeTanksByShip.value[shipName]
  if (!activeSet) return []
  return ship.tank.filter(t => activeSet.has(t.name))
})

/** 탱크 테이블 행도 active만 노출 */
const deviceRowsByShip = computed(() => {
  const map = {}

  shipStore.shipList.forEach(ship => {
    const act = activeTanksByShip.value[ship.name] || new Set()

    map[ship.name] = ship.tank
      .filter(t => act.has(t.name))
      .map(t => ({
        tank: t.name,
        device: '',              // 필요 시 모듈 정보로 채우기
        signal: '',              // 필요 시 채우기
        receive: t.receive ?? '미수신',
        lastTime: t.lastTime ?? '-',
      }))
  })
  return map
})

/** 이벤트 데이터 로드 */
const fetchEvents = async () => {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })

  const params = {
    event_type: '1',
    start_dt: `${today}T00:00:00`,
    end_dt: `${today}T23:59:59`,
  }

  try {
    const data = await getEventList(params)
    eventData.value = data || []
  } catch (error) {
    console.warn('이벤트 데이터 조회 실패 (Mock 모드 사용):', error)
    // 에러 발생해도 계속 진행 (Mock 모드에서는 정상)
  }
}

/** 선택된 호선 변경 시 데이터 갱신 */
watch(() => shipStore.selectedShip, async (newVal) => {
  // 대시보드에서는 active 아닌 호선이 선택되면 보정
  if (newVal && !activeShipNames.value.includes(newVal)) {
    shipStore.selectedShip = dashboardShipList.value[0]?.name || ''
    return
  }
  if (shipStore.selectedShip) {
    await shipStore.syncLatestTankDataFromApi(shipStore.selectedShip)
    shipStore.refreshReceiveStatus(shipStore.selectedShip)
  }
})

let eventIntervalId = null
let flowIntervalId = null
let receiveIntervalId = null
let activeRefreshId = null
let simulationIntervalId = null

onMounted(async () => {
  // 1) 스토어(전체 ship/tank) 초기화
  if (!shipStore.shipList.length) {
    await shipStore.fetchAndInitShipList()
  }

  // 2) 대시보드용 active 집합 로드
  await loadActiveModules()

  // 3) 선택된 호선이 없거나 active가 아니면 보정
  if (!shipStore.selectedShip || !activeShipNames.value.includes(shipStore.selectedShip)) {
    shipStore.selectedShip = dashboardShipList.value[0]?.name || ''
  }

  // 4) Mock 모드: 유량 시뮬레이션 시작
  simulationIntervalId = shipStore.startFlowSimulation()

  // 5) 이벤트 최초/주기 로드
  fetchEvents()
  eventIntervalId = setInterval(fetchEvents, 10000)

  // 6) 유량/통신상태 최초/주기 로드 (10초)
  const loadFlow = async () => {
    if (!shipStore.selectedShip) return
    await shipStore.syncLatestTankDataFromApi(shipStore.selectedShip)
    shipStore.refreshReceiveStatus(shipStore.selectedShip)
  }

  await loadFlow()

  flowIntervalId = setInterval(loadFlow, 10000)

  // 7) 수신/미수신 상태만 프론트에서 1초마다 재계산
  receiveIntervalId = setInterval(() => {
    if (shipStore.selectedShip) {
      shipStore.refreshReceiveStatus(shipStore.selectedShip)
    }
  }, 10000)

  // 8) (옵션) active 집합 주기 갱신—사용중/중지 변경 반영
  activeRefreshId = setInterval(async () => {
    const prevShips = JSON.stringify(activeShipNames.value.sort())

    await loadActiveModules()

    const nextShips = JSON.stringify(activeShipNames.value.sort())

    // 선택된 호선이 더 이상 active가 아니면 보정
    if (!activeShipNames.value.includes(shipStore.selectedShip)) {
      shipStore.selectedShip = dashboardShipList.value[0]?.name || ''
    }
    
    // active ship 변화가 있으면 유량/상태도 갱신
    if (prevShips !== nextShips && shipStore.selectedShip) {
      await shipStore.syncLatestTankDataFromApi(shipStore.selectedShip)
      shipStore.refreshReceiveStatus(shipStore.selectedShip)
    }
  }, 30000)
})

onUnmounted(() => {
  if (eventIntervalId) clearInterval(eventIntervalId)
  if (flowIntervalId) clearInterval(flowIntervalId)
  if (receiveIntervalId) clearInterval(receiveIntervalId)
  if (activeRefreshId) clearInterval(activeRefreshId)
  if (simulationIntervalId) clearInterval(simulationIntervalId)
})
</script>

<style scoped>
/* =========== 기본: 데스크톱(넓은 화면) =========== */
.dashboard-wrapper {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #f9f9f9 100%);
}

.dashboard-wrapper.dark-mode {
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  flex: 0 0 auto;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  border-bottom: 2px solid #e5e7eb;
}

.dashboard-wrapper.dark-mode .header {
  background-color: #1e1e2e;
  border-bottom-color: #4b5563;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header label {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.dashboard-wrapper.dark-mode .header label {
  color: #e0e0e0;
}

.ship-select {
  appearance: none;
  background-color: white;
  color: #1f2937;
  padding: 8px 12px;
  border-radius: 6px;
  border: 2px solid #d1d5db;
  font-size: 14px;
  font-weight: 600;
  width: 160px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dashboard-wrapper.dark-mode .ship-select {
  background-color: #2d2d3d;
  color: #e0e0e0;
  border-color: #4b5563;
}

.ship-select:hover {
  border-color: #2563eb;
}

.ship-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.main-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  gap: 16px;
  overflow: hidden;
  padding: 16px 24px;
}

.tank-status-board {
  flex: 1 1 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 16px;
  min-height: 0;
  overflow: auto;
  padding: 4px;
}

.tank-status-board::-webkit-scrollbar {
  width: 8px;
}

.tank-status-board::-webkit-scrollbar-track {
  background: transparent;
}

.tank-status-board::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 4px;
}

.dashboard-wrapper.dark-mode .tank-status-board::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

/* 이벤트 섹션 */
.events-section {
  padding: 16px 24px;
  background-color: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  border-top: 1px solid #e5e7eb;
  max-height: 40vh;
  overflow-y: auto;
}

.dashboard-wrapper.dark-mode .events-section {
  background-color: #1e1e2e;
  border-top-color: #4b5563;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
}

.events-section::-webkit-scrollbar {
  width: 6px;
}

.events-section::-webkit-scrollbar-track {
  background: transparent;
}

.events-section::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.dashboard-wrapper.dark-mode .events-section::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

/* =========== 좁은 화면(세로로 모두 펼치기) =========== */
@media (max-width: 1919px) {
  .dashboard-wrapper {
    height: auto;
    overflow: auto;
  }

  .main-layout {
    flex-direction: column;
    overflow: visible;
    min-height: auto;
    gap: 12px;
    padding: 12px 16px;
  }

  .tank-status-board {
    flex: 0 0 auto;
    overflow: visible;
    gap: 12px;
  }

  .side-tables {
    flex: 0 0 auto;
    width: 100%;
    min-height: auto;
    overflow: visible;
    gap: 12px;
  }

  .table-half {
    flex: 0 0 auto;
    overflow: visible;
    height: auto;
    min-height: 300px;
  }
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
  }

  .header label {
    font-size: 13px;
  }

  .ship-select {
    width: 100%;
    font-size: 13px;
  }

  .main-layout {
    padding: 8px 12px;
    gap: 10px;
  }

  .tank-status-board {
    gap: 10px;
  }

  .events-section {
    padding: 12px;
    max-height: 300px;
  }
}
</style>
