<template>
  <v-container
    fluid
    class="dashboard-shell"
    :class="[isDark ? 'theme-dark' : 'theme-light']"
  >
    <!-- ========== 1. 헤더 ========== -->
    <div class="dashboard-top reveal">
      <div class="top-left">
        <div class="system-label">WATER TANK MONITORING</div>
        <h1 class="main-title">주수 모니터링 대시보드</h1>
      </div>
      <div class="top-right">
        <!-- 선박 선택 -->
        <v-card class="ship-card" flat border rounded="lg">
          <div class="ship-select-wrap">
            <v-icon icon="mdi-ferry" size="24" />
            <v-select
              v-model="shipStore.selectedShip"
              :items="dashboardShipList"
              item-title="name"
              item-value="name"
              placeholder="선박 선택"
              hide-details
              density="compact"
              variant="plain"
              class="ship-select"
            />
          </div>
        </v-card>
        <!-- KPI 미니 통계 -->
        <div class="header-kpi-group">
          <div class="kpi-mini-box">
            <div class="kpi-mini-icon primary-icon"><v-icon icon="mdi-water" size="16" /></div>
            <div class="kpi-mini-text">
              <div class="kpi-mini-label">탱크</div>
              <div class="kpi-mini-value">{{ selectedTankList.length }}</div>
            </div>
          </div>
          <div class="kpi-mini-box">
            <div class="kpi-mini-icon success-icon"><v-icon icon="mdi-check-circle" size="16" /></div>
            <div class="kpi-mini-text">
              <div class="kpi-mini-label">수신</div>
              <div class="kpi-mini-value">{{ activeTankCount }}</div>
            </div>
          </div>
          <div class="kpi-mini-box">
            <div class="kpi-mini-icon warning-icon"><v-icon icon="mdi-alert-circle" size="16" /></div>
            <div class="kpi-mini-text">
              <div class="kpi-mini-label">미수신</div>
              <div class="kpi-mini-value">{{ selectedTankList.length - activeTankCount }}</div>
            </div>
          </div>
          <div class="kpi-mini-box">
            <div class="kpi-mini-icon info-icon"><v-icon icon="mdi-bell-circle" size="16" /></div>
            <div class="kpi-mini-text">
              <div class="kpi-mini-label">이벤트</div>
              <div class="kpi-mini-value">{{ eventData.length }}</div>
            </div>
          </div>
          <!-- 통신 상태 미니 -->
          <div class="comm-mini-compact">
            <v-icon icon="mdi-wifi-check" size="16" />
            <div
              v-for="tank in selectedTankList.slice(0, 4)"
              :key="tank.name"
              class="comm-mini-dot"
              :class="[tank.receive === '수신' ? 'active' : 'inactive']"
              :title="tank.name"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 2. 콘텐츠 영역 ========== -->
    <div v-if="selectedTankList.length" class="main-content">
      <!-- 2-1. 탱크 그리드 -->
      <div class="section-block reveal">
        <div class="section-header">
          <h2 class="section-title">
            <v-icon icon="mdi-water-opacity" size="20" class="mr-2" />
            실시간 탱크 상태
          </h2>
          <p class="section-desc">수위, 유량, 주수 현황</p>
        </div>
        <div class="tanks-grid">
          <div
            v-for="tank in selectedTankList"
            :key="tank.name"
            class="tank-wrapper"
          >
            <TankStatusBoard
              :tank-id="tank.name"
              :devices="(deviceRowsByShip[shipStore.selectedShip] || []).filter(d => d.tank === tank.name)"
            />
          </div>
        </div>
      </div>

      <!-- 2-2. 그래프 섹션 -->
      <div class="section-block reveal">
        <div class="section-header">
          <h2 class="section-title">
            <v-icon icon="mdi-chart-line" size="20" class="mr-2" />
            주수 현황 그래프
          </h2>
          <p class="section-desc">누적 및 시간당 주수량 추이</p>
        </div>
        <div class="graph-grid">
          <div
            v-for="tank in selectedTankList.slice(0, 2)"
            :key="`graph-${tank.name}`"
            class="graph-pair"
          >
            <GraphPanel
              :tank-id="tank.name"
              type="accumulated"
              fill-height
              from="dashboard"
            />
            <GraphPanel
              :tank-id="tank.name"
              type="hourly"
              fill-height
              from="dashboard"
            />
          </div>
        </div>
      </div>

      <!-- 2-3. 이벤트 로그 -->
      <div class="section-block reveal">
        <div class="section-header">
          <h2 class="section-title">
            <v-icon icon="mdi-bell-outline" size="20" class="mr-2" />
            최근 이벤트 로그
          </h2>
          <p class="section-desc">경보 및 알림 기록</p>
        </div>
        <v-card class="log-card" flat border rounded="lg">
          <div class="log-container">
            <TankEventTable
              :events="eventData || []"
              caller="dashboard"
            />
          </div>
        </v-card>
      </div>
    </div>

    <!-- ========== 3. 빈 상태 ========== -->
    <div v-else class="empty-state reveal">
      <v-icon icon="mdi-water-alert-outline" size="80" class="empty-icon" />
      <h2 class="empty-title">활성화된 탱크가 없습니다</h2>
      <p class="empty-desc">선박을 선택하거나 장비 활성 상태를 확인해주세요</p>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import TankStatusBoard from '@/components/TankStatusBoard.vue'
import TankEventTable from '@/components/TankEventTable.vue'
import GraphPanel from '@/components/GraphPanel.vue'
import { useShipStore } from '@/stores/shipStore'
import { getActiveModulesByShip } from '@/api/module'
import { getEventList } from '@/api/event'

const { global: theme } = useTheme()
const isDark = computed(() => theme.name.value === 'dark')

const shipStore = useShipStore()
const eventData = ref([])

const activeTanksByShip = ref({})
const activeShipNames = computed(() => Object.keys(activeTanksByShip.value || {}))

async function loadActiveModules() {
  try {
    activeTanksByShip.value = await getActiveModulesByShip()
  } catch (e) {
    console.error('활성 모듈 불러오기 실패:', e)
    alert('활성 장비 목록을 불러오는 중 오류가 발생했습니다.')
  }
}

const dashboardShipList = computed(() =>
  shipStore.shipList.filter(s => activeShipNames.value.includes(s.name))
)

const selectedTankList = computed(() => {
  const shipName = shipStore.selectedShip
  const ship = shipStore.shipList.find(s => s.name === shipName)
  if (!ship) return []
  const activeSet = activeTanksByShip.value[shipName]
  if (!activeSet) return []
  return ship.tank.filter(t => activeSet.has(t.name))
})

const activeTankCount = computed(() =>
  selectedTankList.value.filter(t => (t.receive ?? '') !== '미수신').length
)

const deviceRowsByShip = computed(() => {
  const map = {}

  shipStore.shipList.forEach(ship => {
    const act = activeTanksByShip.value[ship.name] || new Set()

    map[ship.name] = ship.tank
      .filter(t => act.has(t.name))
      .map(t => ({
        tank: t.name,
        device: '',
        signal: '',
        receive: t.receive ?? '미수신',
        lastTime: t.lastTime ?? '-',
      }))
  })
  return map
})

const fetchEvents = async () => {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })

  const params = {
    event_type: '1',
    start_dt: `${today}T00:00:00`,
    end_dt: `${today}T23:59:59`,
  }

  try {
    const data = await getEventList(params)
    eventData.value = data
  } catch (error) {
    console.error('이벤트 조회 실패:', error)
    alert('이벤트 데이터를 불러오는 중 오류가 발생했습니다.')
  }
}

watch(() => shipStore.selectedShip, async (newVal) => {
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

onMounted(async () => {
  if (!shipStore.shipList.length) {
    await shipStore.fetchAndInitShipList()
  }

  await loadActiveModules()

  if (!shipStore.selectedShip || !activeShipNames.value.includes(shipStore.selectedShip)) {
    shipStore.selectedShip = dashboardShipList.value[0]?.name || ''
  }

  fetchEvents()
  eventIntervalId = setInterval(fetchEvents, 10000)

  const loadFlow = async () => {
    if (!shipStore.selectedShip) return
    await shipStore.syncLatestTankDataFromApi(shipStore.selectedShip)
    shipStore.refreshReceiveStatus(shipStore.selectedShip)
  }

  await loadFlow()
  flowIntervalId = setInterval(loadFlow, 10000)

  receiveIntervalId = setInterval(() => {
    if (shipStore.selectedShip) {
      shipStore.refreshReceiveStatus(shipStore.selectedShip)
    }
  }, 10000)

  activeRefreshId = setInterval(async () => {
    const prevShips = JSON.stringify(activeShipNames.value.sort())
    await loadActiveModules()
    const nextShips = JSON.stringify(activeShipNames.value.sort())

    if (!activeShipNames.value.includes(shipStore.selectedShip)) {
      shipStore.selectedShip = dashboardShipList.value[0]?.name || ''
    }

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
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard-shell {
  min-height: 100vh;
  height: 100vh;
  padding: 20px;
  background: #f8fafb;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.theme-dark.dashboard-shell {
  background: #0d1117;
}

/* ========== 헤더 ========== */
.dashboard-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.top-left {
  flex: 1;
  min-width: 300px;
}

.system-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #7a8a9f;
  margin-bottom: 6px;
}

.theme-dark .system-label {
  color: #9aacbe;
}

.main-title {
  margin: 0 0 8px 0;
  font-size: 40px;
  font-weight: 800;
  color: #0e1a2b;
  letter-spacing: -0.8px;
}

.theme-dark .main-title {
  color: #f0f6ff;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
}

.ship-card {
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 12px 16px;
  flex: 0 0 auto;
  min-width: 200px;
}

.theme-dark .ship-card {
  background: rgba(18, 23, 30, 0.92) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.32);
}

.ship-select-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ship-select {
  flex: 1;
}

.header-kpi-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.theme-dark .header-kpi-group {
  background: rgba(18, 23, 30, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
}

.kpi-mini-box {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.kpi-mini-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  color: white;
  flex-shrink: 0;
}

.kpi-mini-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.kpi-mini-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #7a8a9f;
}

.theme-dark .kpi-mini-label {
  color: #9aacbe;
}

.kpi-mini-value {
  font-size: 14px;
  font-weight: 700;
  color: #0e1a2b;
}

.theme-dark .kpi-mini-value {
  color: #f0f6ff;
}

.comm-mini-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 6px;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  color: #3b82f6;
}

.theme-dark .comm-mini-compact {
  border-left-color: rgba(255, 255, 255, 0.06);
  color: #60a5fa;
}

.comm-mini-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse-red 2s ease-in-out infinite;
}

.comm-mini-dot.active {
  background: #10b981;
  animation: pulse-green 2s ease-in-out infinite;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-shrink: 1;
  overflow: visible;
  min-height: 0;
}

.section-block:nth-child(1) {
  flex: 0 0 auto;
  min-height: 0;
}

.section-block:nth-child(2) {
  flex: 0 0 auto;
  min-height: 0;
}

.section-block:nth-child(3) {
  flex: 0 0 auto;
  min-height: 0;
}

.theme-dark .section-block {
  background: rgba(18, 23, 30, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.32);
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 8px;
  flex-shrink: 0;
  min-height: fit-content;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: #0e1a2b;
  gap: 6px;
}

.theme-dark .section-title {
  color: #f0f6ff;
}

.section-desc {
  margin: 0;
  font-size: 11px;
  color: #7a8a9f;
}

.theme-dark .section-desc {
  color: #9aacbe;
}

.tanks-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  width: 100%;
  flex: 1;
  align-content: start;
  overflow: visible;
  padding-right: 0;
}

.tank-wrapper {
  min-width: 0;
  min-height: 0;
}

.graph-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  width: 100%;
  flex: 1;
  min-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.graph-pair {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
}

.log-card {
  background: rgba(255, 255, 255, 0.96) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 12px;
}

.theme-dark .log-card {
  background: rgba(18, 23, 30, 0.88) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
}

.log-container {
  max-height: 100%;
  overflow-y: auto;
  padding: 6px;
  font-size: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  color: rgba(0, 0, 0, 0.15);
  margin-bottom: 12px;
}

.theme-dark .empty-icon {
  color: rgba(255, 255, 255, 0.15);
}

.empty-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0e1a2b;
}

.theme-dark .empty-title {
  color: #f0f6ff;
}

.empty-desc {
  margin: 0;
  font-size: 14px;
  color: #7a8a9f;
  max-width: 400px;
}

.theme-dark .empty-desc {
  color: #9aacbe;
}

.reveal {
  animation: fadeInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1400px) {
  .tanks-grid {
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  }
}

@media (max-width: 1000px) {
  .tanks-grid {
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-shell {
    padding: 14px;
    gap: 10px;
  }

  .dashboard-top {
    flex-direction: column;
    gap: 10px;
  }

  .main-title {
    font-size: 28px;
    margin-bottom: 4px;
  }

  .top-right {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .ship-card {
    width: 100%;
    min-width: auto;
    padding: 10px 12px;
  }

  .header-kpi-group {
    width: 100%;
    flex-wrap: wrap;
    padding: 6px 10px;
    gap: 6px;
  }

  .section-title {
    font-size: 13px;
  }

  .section-block {
    padding: 12px;
    gap: 10px;
  }

  .section-block:nth-child(1) {
    flex: 1.1;
  }

  .section-block:nth-child(2) {
    flex: 0.85;
  }

  .section-block:nth-child(3) {
    flex: 0.95;
  }

  .tanks-grid {
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    padding-right: 2px;
  }

  .graph-grid {
    gap: 10px;
    grid-template-columns: 1fr;
    padding-right: 2px;
  }

  .graph-pair {
    grid-template-columns: 1fr;
  }

  .log-container {
    padding: 4px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .dashboard-shell {
    padding: 12px;
    gap: 8px;
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }

  .main-title {
    font-size: 24px;
    margin-bottom: 2px;
  }

  .dashboard-top {
    flex-direction: column;
    gap: 10px;
  }

  .top-right {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .ship-card {
    width: 100%;
    min-width: auto;
    padding: 8px 10px;
  }

  .ship-select-wrap {
    gap: 8px;
  }

  .header-kpi-group {
    width: 100%;
    padding: 6px 8px;
    gap: 4px;
    flex-wrap: wrap;
  }

  .kpi-mini-box {
    flex: 0 0 calc(50% - 4px);
    min-width: 60px;
  }

  .kpi-mini-icon {
    width: 20px;
    height: 20px;
  }

  .kpi-mini-value {
    font-size: 12px;
  }

  .kpi-mini-label {
    font-size: 7px;
  }

  .comm-mini-compact {
    flex: 0 0 100%;
    border-left: none;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    padding-top: 4px;
    padding-left: 0;
    justify-content: flex-start;
  }

  .main-content {
    gap: 10px;
    overflow-y: auto;
  }

  .section-title {
    font-size: 12px;
  }

  .section-block {
    padding: 10px;
    gap: 8px;
  }

  .section-block:nth-child(1) {
    flex: 1.1;
  }

  .section-block:nth-child(2) {
    flex: 1;
  }

  .section-block:nth-child(3) {
    flex: 1;
  }

  .tanks-grid {
    gap: 10px;
    grid-template-columns: 1fr;
    padding-right: 0;
  }

  .graph-grid {
    gap: 10px;
    grid-template-columns: 1fr;
    padding-right: 0;
  }

  .graph-pair {
    grid-template-columns: 1fr;
  }

  .log-container {
    padding: 4px;
    font-size: 10px;
  }
}

.log-container::-webkit-scrollbar {
  width: 6px;
}

.log-container::-webkit-scrollbar-track {
  background: transparent;
}

.log-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.theme-dark .log-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}

.theme-dark .log-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.theme-dark .main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.theme-dark .main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.primary-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.success-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.warning-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.info-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}
</style>



