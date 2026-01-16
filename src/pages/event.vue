<template>
  <div class="event-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    <div class="filter-section">
      <div class="filters">
        <div class="filter-item">
          <label>구분 :</label>
          <select v-model="selectedType">
            <option value="전체">전체</option>
            <option value="1">유량계</option>
            <option value="2">엑셀 다운로드</option>
            <option value="3">알림 발송</option>
            <option value="4">장비 관리</option>
            <option value="5">Edge Event</option>
          </select>
        </div>

        <div class="filter-item date-picker">
          <label>조회 범위 :</label>
          <div class="date-input-wrapper">
            <input type="date" v-model="startDate" ref="startDateInput" />
            <span class="calendar-icon" @click="focusStartDate">📅</span>
          </div>
          <span>~</span>
          <div class="date-input-wrapper">
            <input type="date" v-model="endDate" ref="endDateInput" />
            <span class="calendar-icon" @click="focusEndDate">📅</span>
          </div>
        </div>

        <div class="filter-item">
          <label>호선 :</label>
          <select v-model="selectedShip">
            <option value="전체">전체</option>
            <option v-for="ship in shipList" :key="ship.name" :value="ship.name">{{ ship.name }}</option>
          </select>
        </div>

        <div class="filter-item">
          <label>탱크 :</label>
          <select v-model="selectedTank">
            <option value="전체">전체</option>
            <option
              v-for="tank in filteredTanks"
              :key="tank.id"
              :value="tank.name"
            >
              {{ tank.name }}
            </option>
          </select>
        </div>

        <button class="reset-button" @click="resetFilters">초기화</button>
      </div>

      <div class="filter-actions">
        <!-- 조회 버튼: Primary Color 적용 -->
        <button
          class="search-button"
          @click="fetchEvents"
          :style="{ backgroundColor: primaryColor }"
        >조회</button>
        <button class="excel-button" @click="handleExcelDownloadModal">엑셀 다운로드</button>
      </div>
    </div>

    <div class="event-table-section" v-if="showResult">
      <TankEventTable :events="allEvents" caller="event" />
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal" :class="isDark ? 'dark-mode' : 'light-mode'">
        <p>다음의 조건으로 다운로드 하시겠습니까?</p>
        <ul class="modal-conditions">
          <li>구분 : {{ typeMap[selectedType] || '전체' }}</li>
          <li>
            조회 범위 :
            <span v-if="!startDate && !endDate">전체 기간</span>
            <span v-else-if="startDate && !endDate">{{ `시작일: ${startDate} ~ 미지정` }}</span>
            <span v-else-if="!startDate && endDate">{{ `시작일: 미지정 ~ ${endDate}` }}</span>
            <span v-else>{{ `${startDate} ~ ${endDate}` }}</span>
          </li>
          <li>호선 : {{ selectedShip }}</li>
          <li>탱크 : {{ selectedTank }}</li>
          <li>상태 : {{ selectedStatus }}</li>
        </ul>
        <div class="modal-buttons">
          <button @click="confirmDownload">확인</button>
          <button @click="closeModal">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axiosIns from '@/plugins/axios'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { ref, computed, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import TankEventTable from '@/components/TankEventTable.vue'
import { useShipStore } from '@/stores/shipStore'
import { getEventList, insertEvent } from '@/api/event'

// 테마 컬러 가져오기
const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)
const primaryColor = computed(() => theme.current.value.colors.primary)

const shipStore = useShipStore()
const shipList = computed(() => shipStore.shipList)
const tankMap = computed(() => shipStore.tankMap)

const selectedType = ref('전체')
const startDate = ref('')
const endDate = ref('')
const selectedShip = ref('전체')
const selectedTank = ref('전체')
const selectedStatus = ref('전체')

const showResult = ref(false)
const showModal = ref(false)
const allEvents = ref([])
const startDateInput = ref(null)
const endDateInput = ref(null)

const typeMap = {
  1: '유량계',
  2: '엑셀 다운로드',
  3: '알림 발송',
  4: '장비 관리',
  5: 'Edge Event',
}

function ymdKst(d) {
  return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
}

function setDefaultDateRange() {
  const today = new Date()
  const from = new Date(today)

  from.setDate(today.getDate() - 30)

  startDate.value = ymdKst(from)
  endDate.value = ymdKst(today)
}


const filteredTanks = computed(() => {
  if (selectedShip.value === '전체') return []
  const ship = shipStore.shipList.find(s => s.name === selectedShip.value)
  return ship ? ship.tank : []
})

function resetFilters() {
  selectedType.value = '전체'
  selectedShip.value = '전체'
  selectedTank.value = '전체'
  selectedStatus.value = '전체'
  setDefaultDateRange()
  showResult.value = false
  allEvents.value = []
}

async function fetchEvents() {
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    alert('시작일은 종료일보다 늦을 수 없습니다.')
    return
  }

  const params = {
    event_type: selectedType.value,
    ship_no: selectedShip.value,
    tank_name: selectedTank.value
  }

  if (startDate.value) params.start_dt = startDate.value + 'T00:00:00'
  if (endDate.value) params.end_dt = endDate.value + 'T23:59:59'

  try {
    allEvents.value = await getEventList(params)
    showResult.value = true
  } catch (error) {
    console.error('이벤트 데이터 조회 실패:', error)
    alert('이벤트 데이터를 불러오는 중 오류가 발생했습니다.')
  }
}

function handleExcelDownloadModal() {
  if (showResult.value) showModal.value = true
  else alert('조회를 먼저 해주십시오.')
}

const closeModal = () => { showModal.value = false }


async function confirmDownload() {
  if (!allEvents.value.length) {
    alert('다운로드할 이벤트 데이터가 없습니다.')
    return
  }

  const now = dayjs().format('YYYY-MM-DD_HHmmss')

  // 엑셀 생성
  const wb = XLSX.utils.book_new()

  const ws = XLSX.utils.json_to_sheet(
    allEvents.value.map(e => ({
      이벤트ID: e.event_idx,
      구분: e.event_type,
      호선: e.ship_no,
      탱크: e.tank_name,
      내용: e.string_kr,
      등록일: e.rgst_dt,
    }))
  )

  XLSX.utils.book_append_sheet(wb, ws, '이벤트 이력')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  saveAs(
    new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `event_list_${now}.xlsx`
  )

  showModal.value = false

  // 엑셀 다운로드 이벤트 기록 (환경변수 기반 API 모듈)
  try {
    const ts = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')

    await insertEvent({
      eventType: 2,                    // 프로젝트 규칙: 엑셀 다운로드 이벤트
      shipNo: selectedShip.value,
      tankName: '전체',
      stringKr: '이벤트 리스트 엑셀 다운로드',
      rgstDt: ts,
      createdAt: ts,
    })
  } catch (error) {
    console.error('엑셀 다운로드 이벤트 기록 실패:', error)
  }
}

function focusStartDate() { startDateInput.value?.click() }
function focusEndDate()   { endDateInput.value?.click() }

watch(selectedShip, newVal => { if (newVal === '전체') selectedTank.value = '전체' })

onMounted(() => {
  resetFilters()
})
</script>



<style scoped>
.event-page {
  padding: 16px;
  font-family: sans-serif;
  color: white;
  background-color: #1a1a2f;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  flex: 1 1 auto;
  min-width: 300px;
}
.filter-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  justify-content: flex-end;
  align-items: center;
  min-width: max-content;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.filter-item label {
  white-space: nowrap;
}

.filter-item select,
.filter-item date-picker {
  background-color: white;
  color: black;
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  font-weight: bold;
  width: 160px;
  appearance: auto;
}

.date-picker .date-input-wrapper {
  position: relative;
}

.date-input-wrapper input[type='date'] {
  background-color: white;
  color: black;
  padding: 4px 12px;
  padding-right: 32px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  font-weight: bold;
  width: 160px;
  appearance: none;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  background: transparent;
  color: transparent;
  cursor: pointer;
  width: 100%;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
}

.date-picker .calendar-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 16px;
}
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}
.search-button,
.excel-button {
  padding: 6px 12px;
  font-weight: bold;
  border-radius: 6px;
  border: none;
  background-color: #754bcb;
  color: white;
  cursor: pointer;
}
.excel-button {
  background-color: #1d6d43;
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
  background: white;
  padding: 20px;
  border-radius: 8px;
  color: black;
  width: 300px;
}
.modal-conditions {
  list-style: none;
  padding: 0;
  margin-top: 12px;
  margin-bottom: 16px;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.modal-buttons button {
  padding: 6px 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.modal-buttons button:first-child {
  background-color: #754bcb;
  color: white;
}
.modal-buttons button:last-child {
  background-color: black;
  color: white;
}
@media (max-width: 1400px) {
  .filter-item select,
  .date-picker .date-input-wrapper input[type='date'] {
    width: 120px;
    font-size: 13px;
    padding: 4px 8px;
  }

  .search-button,
  .excel-button {
    padding: 4px 8px;
    font-size: 13px;
  }

  .filter-item {
    font-size: 13px;
  }

  .modal {
    width: 260px;
  }

  .modal-buttons button {
    padding: 4px 10px;
    font-size: 13px;
  }
}
@media (max-width: 1537px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    justify-content: flex-end;
    margin-top: 8px;
  }
}
.event-page.dark-mode {
  background-color: #1a1a2f;
  color: white;
}
.event-page.light-mode {
  background-color: #ffffff;
  color: #222;
}
.filter-item.dark-mode{
  color: white;
}
.filter-item.light-mode{
  color: black;
}
.modal.dark-mode {
  background-color: #2a2a3f;
  color: white;
}
.modal.light-mode {
  background-color: #ffffff;
  color: #000000;
}
.reset-button {
  padding: 6px 12px;
  font-weight: bold;
  border-radius: 6px;
  border: none;
  background-color: #999;
  color: white;
  cursor: pointer;
}
</style>
