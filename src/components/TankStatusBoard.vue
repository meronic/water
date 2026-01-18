<template>
  <div
    v-if="tank"
    class="tank-card"
    :class="[isDark ? 'dark-mode' : 'light-mode']"
  >
    <h3 class="tank-title">
      {{ tank.name }}
    </h3>

    <div
      class="top-section"
      :class="{ 'merge-mode': tank.merge }"
    >
      <div class="info-left-group">
        <div class="status-info">
          <div class="status-label">
            현재 수위
          </div>
          <div class="status-bar">
            <div
              class="status-fill"
              :style="{ height: (currentHeight / maxHeight * 100)?.toFixed(1) + '%' }"
            />
            <span class="status-text">{{ currentHeight?.toFixed(2) }} m</span>
          </div>

          <div class="flow-bar-horizontal">
            <div class="flow-label">
              실시간 유량
            </div>
            <div class="flow-bar">
              <div
                class="flow-fill"
                :style="{ width: barWidth }"
              />
              <span class="flow-overlay">
                {{ tank.flow ?? 0 }} {{ tank.unit }}㎥/h
              </span>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <h3 class="table-title">
            주수 정보
          </h3>
          <table class="tank-data-table">
            <tbody>
              <tr class="header-row">
                <td>구분</td><td>주수유량계</td>
              </tr>
              <tr><td>목표</td><td>{{ tank.goal }}m³</td></tr>
              <tr><td>실적</td><td>{{ Number(tank.actual)?.toFixed(1) }}m³</td></tr>
              <tr><td>달성률</td><td>{{ status }}%</td></tr>
              <tr><td>실시간</td><td>{{ tank.flow ?? 0 }}㎥/h</td></tr>
            </tbody>
          </table>
        </div>
        <TankDeviceTable
          :devices="devices"
          :tank_name="tank.name"
          class="device-table-wrapper"
        />
      </div>
    </div>

    <div class="graph-section">
      <GraphPanel
        type="accumulated"
        :tankId="tank.name"
        :goalValue="tank.goal"
        from="dashboard"
        interval="1h"
        :refresh="refreshCounter"
      />
      <GraphPanel
        type="hourly"
        :tankId="tank.name"
        :goalValue="tank.goal"
        from="dashboard"
        interval="1h"
        :refresh="refreshCounter"
      />
    </div>
  </div>
</template>

<script setup>
import axiosIns from '@/plugins/axios'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from 'vuetify'
import GraphPanel from '@/components/GraphPanel.vue'
import TankDeviceTable from '@/components/TankDeviceTable.vue'
import { useShipStore } from '@/stores/shipStore'
import { estimateTankHeight, getTankMaxHeight } from '@/api/tankVolume'

const props = defineProps({
  tankId: { type: String, required: true },
  devices: { type: Array, default: () => [] },
  tank: { type: Object, required: false },
})

const shipStore = useShipStore()
const refreshCounter = ref(0)
let tankInterval = null
let refreshInterval = null

const getUTCToday = () => new Date().toISOString().slice(0, 10)

// const todayUTC = getUTCToday()

const tankList = computed(() => {
  const ship = shipStore.shipList.find(s => s.name === shipStore.selectedShip)
  return ship ? ship.tank : []
})

const tank = computed(() => tankList.value.find(t => t.name === props.tankId) || null)

const status = computed(() => {
  if (!tank.value || !tank.value.goal) return 0
  return Math.round((tank.value.actual / tank.value.goal) * 100)
})

const barWidth = computed(() => {
  const flow = tank.value?.flow ?? 0
  return flow > 0 ? `${Math.min((flow / 400) * 100, 100)}%` : '0%'
})

// 수위 계산용
const currentHeight = ref(0)
const maxHeight = ref(1)

const fetchTankHeight = async () => {

  if (!tank.value || !tank.value.actual) return

  try {
    const height = await estimateTankHeight({
      ship_no: shipStore.selectedShip,
      tank_name: tank.value.name,
      current_volume: tank.value.actual,
    })

    if(height && height.currentheight)
      currentHeight.value = height.currentheight

    const maxheight = await getTankMaxHeight({
      ship_no: shipStore.selectedShip,
      tank_name: tank.value.name,
    })

    if(maxheight && maxheight.maxheight) 
      maxHeight.value = maxheight.maxheight
    else 
      maxHeight.value = 1

  } catch (e) {
    console.error('수위 계산 실패:', e)
    currentHeight.value = 0
    maxHeight.value = 1
  }
}

onMounted(() => {
  if (shipStore.selectedShip) {
    shipStore.syncLatestTankDataFromApi(shipStore.selectedShip)

    tankInterval = setInterval(() => {
      shipStore.syncLatestTankDataFromApi(shipStore.selectedShip)
    }, 10000)

    refreshInterval = setInterval(() => {
      refreshCounter.value++
      fetchTankHeight()
    }, 10000)

    fetchTankHeight()
  }
})

onUnmounted(() => {
  if (tankInterval) clearInterval(tankInterval)
  if (refreshInterval) clearInterval(refreshInterval)
})

const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)
</script>

<style scoped>
.tank-card {
  padding: 10px;
  border-radius: 12px;
  width: calc(50% - 6px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;

  /* 겹침 방지 */
  gap: 12px;
  isolation: isolate;
}
.tank-card.dark-mode { background-color: #2b2b3b; color: white; }
.tank-card.light-mode { background-color: #fff; color: #222; }

.tank-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 6px;
}

/* === 상단 묶음: 가운데 정렬 + 여백만 === */
.top-section {
  display: flex;
  justify-content: center;   /* 가로 가운데 */
  align-items: center;       /* 세로 가운데 */
  flex-wrap: wrap;           /* 줄바꿈 허용 */
  margin: 10px;
  gap: 10px;                 /* 아이템 간 여백 */
}

/* merge 모드일 때 여백과 크기 조정 */
.top-section.merge-mode {
  gap: 100px;                 /* 아이템 간 여백 ↑ */
}

.top-section.merge-mode .status-info,
.top-section.merge-mode .device-table-wrapper {
  flex: 1 1 48%;             /* 가로폭 조금 더 늘림 */
  min-width: 300px;          /* 카드가 너무 좁아지지 않도록 */
}
.status-info{
  min-width: 150px;
}

/* 왼쪽 그룹(수위+테이블)도 내용 크기만큼만 */
.info-left-group {
  display: flex;
  flex: 0 0 auto;            /* 확장 금지 */
  gap: 12px;
  min-width: 0;
  flex-wrap: nowrap;
  justify-content: center;   /* 내부도 가운데 */
  align-items: center;
}
/* base보다 아래쪽(나중)에 두기) */
.top-section.merge-mode .info-left-group {
  gap: 100px;
}


/* 수위 카드 자체도 내용 크기만 */
.status-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 0 0 auto;            /* 공간 확장 안 함 */
  align-items: center;       /* 내부 센터 */
}
.status-label { font-weight: bold; font-size: 16px; text-align: center; }

.status-bar {
  width: 100%; height: 100px; border-radius: 4px; position: relative; overflow: hidden;
  background-color: #ddd; display: flex; align-items: center; justify-content: center;
}
.tank-card.dark-mode .status-bar { background-color: #444; }

.status-fill { position: absolute; bottom: 0; width: 100%; transition: height 0.4s ease; background-color: #2563eb; z-index: 1; }
.tank-card.dark-mode .status-fill { background-color: #3b82f6; }

.status-text { position: absolute; z-index: 2; font-weight: bold; font-size: 14px; color: #000; }
.tank-card.dark-mode .status-text { color: white; }

/* 유량 바 */
.flow-bar-horizontal { width: 100%; display: flex; flex-direction: column; gap: 6px; text-align: center; }
.flow-bar { height: 24px; border-radius: 6px; overflow: hidden; width: 100%; background-color: #ddd; position: relative; }
.tank-card.dark-mode .flow-bar { background-color: #444; }
.flow-fill { height: 100%; background-color: #60a5fa; transition: width 0.4s ease; position: relative; }

.flow-overlay {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 2; font-size: 13px; font-weight: bold; white-space: nowrap; pointer-events: none;
  text-align: center; 
  /* color: white; */
}

.flow-label { font-weight: bold; font-size: 16px; }
.flow-value { font-weight: bold; font-size: 13px; margin-top: 4px; }

/* 가운데 테이블도 내용 크기만 */
.table-wrapper {
  flex: 0 0 auto;            /* 더 이상 공간 확장 안함 */
  min-width: 200px;          /* 필요 최소폭만 */
  text-align: center;
}
.table-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; text-align: center; }

.tank-data-table { border-collapse: collapse; min-width: 200px; font-size: 15px; text-align: center; color: #000; }
.tank-card.dark-mode .tank-data-table { color: white; }
.tank-data-table td { padding: 6px; border: 1px solid #bbb; }
.tank-card.dark-mode .tank-data-table td { border: 1px solid #888; }
.tank-data-table .header-row { background-color: #e0e0e0; }
.tank-card.dark-mode .tank-data-table .header-row { background-color: #505060; }

/* 오른쪽 장치 테이블도 내용 크기만 */
.device-table-wrapper {
  flex: 0 0 auto;     /* 확장하지 않고 내용만큼만 차지 */
  min-width: auto;    /* 강제 최소폭 해제 */
  margin: 0px;          /* 여백 제거 */
  /* padding: 0px;         혹시 기본 패딩도 제거 */
  text-align: center;
}

/* 그래프 섹션: 아래 레이어 + 오버플로우 숨김 */
.graph-section {
  flex: 1 1 0;
  min-height: 400px;
  display: grid;
  grid-template-rows: repeat(2, minmax(175px, 1fr));
  grid-auto-rows: minmax(175px, 1fr);
  gap: 12px;
  width: 100%;

  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* 반응형 */
/* === 작은 화면(<=750px): merge 여부와 무관하게 동일하게 정렬/레이아웃 === */
@media (max-width: 750px) {
  /* 상단 섹션 공통 */
  .top-section {
    gap: 10px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  /* 내부 그룹/카드 공통 */
  .top-section .status-info,
  .top-section .device-table-wrapper,
  .top-section .table-wrapper,
  .top-section .info-left-group {
    flex: 1 1 100%;
    min-width: 0;
  }

  /* info-left-group도 감싸기/중앙 정렬 */
  .top-section .info-left-group {
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  /* 내부 요소 폭 확장 */
  .top-section .status-bar,
  .top-section .flow-bar-horizontal,
  .top-section .tank-data-table {
    width: 100%;
  }

  /* 그래프 섹션은 단일 컬럼 */
  .graph-section {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-auto-flow: row;
    grid-auto-rows: minmax(175px, auto);
    gap: 10px;
  }
}

/* === 더 작은 화면(<=600px): 동일 원칙 + 세부 크기 보정 === */
@media (max-width: 600px) {
  .tank-card { width: 100%; padding: 8px; }

  .top-section .status-bar {
    height: clamp(80px, 15vw, 100px);
  }

  .top-section .tank-data-table {
    font-size: clamp(12px, 2vw, 14px);
    overflow-x: auto;
  }

  .graph-section {
    gap: 8px;
    grid-template-rows: repeat(2, minmax(175px, 1fr));
  }
}
</style>


