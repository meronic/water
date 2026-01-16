<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <div class="detail-info-wrapper" :class="[isDark ? 'dark-mode' : 'light-mode']">
    <div class="filters">
      <div class="filter-controls">
        <label>호선 :</label>
        <select v-model="selectedShip" class="ship-select">
          <option disabled value="">선택</option>
          <option
            v-for="ship in shipStore.shipList"
            :key="ship.name"
            :value="ship.name"
          >
            {{ ship.name }}
          </option>
        </select>
      </div>

      <div class="filter-actions">
        <!-- 조회 버튼: primary 테마 컬러 적용 -->
        <button
          class="search-button"
          @click="handleSearch"
          :style="{ backgroundColor: primaryColor }"
        >
          조회
        </button>

        <!-- 엑셀 다운로드 버튼: 기존 지정색 유지 -->
        <button class="excel-button" @click="handleExcelDownloadModal">
          엑셀 다운로드
        </button>
      </div>
    </div>

    <div class="graphs" v-if="searched">
      <div
        v-for="tank in tankList"
        :key="tank.id"
        class="tank-graph-section"
        v-intersect="() => refreshGraph(tank.name)"
      >
        <h3 class="tank-title" :class="[isDark ? 'dark-mode' : 'light-mode']">
          {{ tank.name }}
        </h3>
        <div class="graph-wrapper">
          <div class="graph-panel">
            <GraphPanel
              type="accumulated"
              :tankId="tank.name"
              :fillHeight="true"
              :goalValue="tank.goal"
              :key="refreshKeyMap[tank.name + '-acc']"
              from="detail"
            />
          </div>
          <div class="graph-panel">
            <GraphPanel
              type="hourly"
              :tankId="tank.name"
              :fillHeight="true"
              :goalValue="tank.goal"
              :key="refreshKeyMap[tank.name + '-hour']"
              from="detail"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal" :class="isDark ? 'dark-mode' : 'light-mode'">
        <p>다음의 조건으로 다운로드 하시겠습니까?</p>
        <ul class="modal-conditions">
          <li>호선: {{ selectedShip }}</li>
        </ul>
        <div class="modal-buttons">
          <!-- 확인 버튼: primary 테마 컬러 적용 -->
          <button
            class="confirm-button"
            @click="confirmDownload"
            :style="{ backgroundColor: primaryColor }"
          >
            확인
          </button>
          <!-- 취소 버튼: 기존 색 유지 -->
          <button class="cancel-button" @click="showModal = false">
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import GraphPanel from '@/components/GraphPanel.vue'
import { useShipStore } from '@/stores/shipStore'
import axiosIns from '@/plugins/axios'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { getDownGraph } from '@/api/flow'
import { insertEvent } from '@/api/event'

const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)

// 조회 버튼과 모달 확인 버튼에만 동적 primary 컬러 바인딩
const primaryColor = computed(() => theme.current.value.colors.primary)

const shipStore = useShipStore()
const searched = ref(false)
const showModal = ref(false)
const tankList = ref([])

const selectedShip = computed({
  get: () => shipStore.selectedShip,
  set: val => (shipStore.selectedShip = val),
})

const refreshKeyMap = reactive({})

function enrichTank(t) {
  return { ...t, status: t.goal ? Math.round((t.actual / t.goal) * 100) : 0 }
}

function handleSearch() {
  if (!selectedShip.value) {
    alert('호선을 선택해주세요.')
    return
  }
  const data = shipStore.shipList.find(s => s.name === selectedShip.value)

  tankList.value = data?.tank.map(enrichTank) || []
  searched.value = true
  tankList.value.forEach(t => {
    refreshKeyMap[t.name + '-acc'] = Math.random()
    refreshKeyMap[t.name + '-hour'] = Math.random()
  })
}

function refreshGraph(name) {
  refreshKeyMap[name + '-acc'] = Math.random()
  refreshKeyMap[name + '-hour'] = Math.random()
}

function handleExcelDownloadModal() {
  if (!searched.value) {
    alert('조회를 먼저 해주세요.')
    return
  }
  showModal.value = true
}

function confirmDownload() {
  handleExcelDownload()
  showModal.value = false
}

async function handleExcelDownload() {
  try {
    const rows = await getDownGraph({ unit: '30m', shipNo: selectedShip.value })
    if (!rows.length) {
      alert('다운로드할 이벤트 데이터가 없습니다.')
      return
    }

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

    saveAs(
      new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `graph_${selectedShip.value}_${dayjs().format('YYYY-MM-DD_HHmmss')}.xlsx`
    )

    // 엑셀 다운로드 이벤트 기록
    const ts = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')

    await insertEvent({
      eventType: 2,
      shipNo: selectedShip.value,
      tankName: '전체',
      stringKr: '상세 정보 엑셀 다운로드',
      rgstDt: ts,
      createdAt: ts,
    })
  } catch (e) {
    console.error('엑셀 다운로드 실패:', e)
    alert('엑셀 다운로드 중 오류가 발생했습니다.')
  }
  
}
onMounted(handleSearch)
</script>

<style scoped>
.detail-info-wrapper {
  padding: 16px;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.detail-info-wrapper.dark-mode {
  background: #1e1e2d;
  color: white;
}
.detail-info-wrapper.light-mode {
  background: #ffffff;
  color: #222;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}
.filter-actions {
  display: flex;
  gap: 8px;
}
.ship-select {
  background: white;
  color: black;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  font-weight: bold;
  width: 160px;
  appearance: auto;
}
.graphs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}
.tank-graph-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100% - 28px);
}
.tank-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}
.tank-title.dark-mode {
  color: white;
}
.tank-title.light-mode {
  color: #222;
}
.graph-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
}
.graph-panel {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.search-button,
.confirm-button {
  padding: 6px 12px;
  font-weight: bold;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
}

.excel-button {
  padding: 6px 12px;
  font-weight: bold;
  border-radius: 6px;
  border: none;
  background-color: #1d6d43;
  color: white;
  cursor: pointer;
}

.cancel-button {
  padding: 6px 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  background-color: black;
  color: white;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  padding: 20px;
  border-radius: 8px;
  width: 300px;
}
.modal.dark-mode {
  background: #2a2a3f;
  color: white;
}
.modal.light-mode {
  background: #ffffff;
  color: #000;
}

.modal-conditions {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-height: 705px) {
  .graphs { height: auto; }
  .tank-graph-section { height: 180%; }
  .graph-wrapper { height: 360px; }
  .graph-panel { height: 50%; }
}
</style>