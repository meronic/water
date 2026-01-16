<template>
  <div class="event-table-wrapper">
    <!-- 모바일 보기 -->
    <div v-if="isMobile" class="mobile-list">
      <div
        v-for="(event, idx) in paginatedEvents"
        :key="event.id || idx"
        class="event-card"
        :class="[getEventStatus(event)]"
      >
        <div class="event-header">
          <span class="event-type">{{ event.string_kr }}</span>
          <span class="event-time">{{ formatTime(event.rgst_dt) }}</span>
        </div>
        <div class="event-meta">
          <span class="badge">{{ event.ship_no }}</span>
          <span class="badge">{{ event.tank_name }}</span>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination-mobile">
        <v-btn
          icon="mdi-chevron-left"
          size="small"
          :disabled="currentPage === 0"
          @click="currentPage--"
        />
        <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <v-btn
          icon="mdi-chevron-right"
          size="small"
          :disabled="currentPage === totalPages - 1"
          @click="currentPage++"
        />
      </div>
    </div>

    <!-- 데스크톱 보기 -->
    <v-table v-else class="event-table" density="compact" hover fixed-header>
      <thead>
        <tr>
          <th class="col-type">유형</th>
          <th class="col-time">발생 시간</th>
          <th class="col-ship">호선</th>
          <th class="col-tank">탱크</th>
          <th class="col-detail">세부사항</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!paginatedEvents.length" class="empty-row">
          <td colspan="5" class="text-center">
            <v-icon icon="mdi-information-outline" class="mr-2" />
            이벤트 기록이 없습니다
          </td>
        </tr>
        <tr
          v-for="(event, idx) in paginatedEvents"
          :key="event.id || idx"
          :class="[getEventStatus(event)]"
        >
          <td class="col-type">
            <span class="type-badge">{{ event.string_kr }}</span>
          </td>
          <td class="col-time">{{ formatDateTime(event.rgst_dt) }}</td>
          <td class="col-ship">{{ event.ship_no }}</td>
          <td class="col-tank">{{ event.tank_name }}</td>
          <td class="col-detail">
            <span class="detail-text">{{ getEventDetail(event) }}</span>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- 데스크톱 페이지네이션 -->
    <div v-if="totalPages > 1 && !isMobile" class="pagination">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="5"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps({
  events: { type: Array, default: () => [] },
  caller: { type: String, default: 'dashboard' },
})

const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)
const currentPage = ref(0)
const itemsPerPage = computed(() => (isMobile.value ? 5 : 10))

// 정렬된 이벤트 (최신순)
const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => {
    const dateA = new Date(a.rgst_dt || 0)
    const dateB = new Date(b.rgst_dt || 0)
    return dateB - dateA
  })
})

// 페이지네이션된 이벤트
const paginatedEvents = computed(() => {
  const start = currentPage.value * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedEvents.value.slice(start, end)
})

// 전체 페이지 수
const totalPages = computed(() => {
  return Math.ceil(sortedEvents.value.length / itemsPerPage.value) || 1
})

// 이벤트 상태 클래스
const getEventStatus = (event) => {
  const type = String(event.event_type)
  if (type === '1') return 'alarm' // 경보
  if (type === '2') return 'warning' // 경고
  if (type === '3') return 'info' // 정보
  return 'neutral'
}

// 이벤트 상세정보
const getEventDetail = (event) => {
  const type = String(event.event_type)
  if (type === '1') return '주수 시작'
  if (type === '2') return '주수 완료'
  if (type === '3') return '시스템 알림'
  return event.string_kr
}

// 시간 포맷팅 (HH:MM)
const formatTime = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return dateStr
  }
}

// 날짜시간 포맷팅 (YYYY-MM-DD HH:MM)
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch {
    return dateStr
  }
}

// 페이지 리셋 (이벤트 변경시)
watch(
  () => props.events.length,
  () => {
    currentPage.value = 0
  }
)

import { watch } from 'vue'
</script>

<style scoped>
.event-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 데스크톱 테이블 */
.event-table {
  font-size: 13px;
}

.event-table :deep(thead tr) {
  background: rgba(0, 0, 0, 0.02);
}

.event-table :deep(th) {
  font-weight: 700;
  color: #6b7c93;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 8px !important;
}

.event-table :deep(td) {
  padding: 10px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.event-table :deep(tbody tr):hover {
  background: rgba(0, 0, 0, 0.02) !important;
}

.col-type {
  width: 100px;
}

.col-time {
  width: 160px;
}

.col-ship {
  width: 80px;
}

.col-tank {
  width: 100px;
}

.col-detail {
  flex: 1;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-table :deep(tbody tr.alarm) .type-badge {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.event-table :deep(tbody tr.warning) .type-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #d97706;
}

.event-table :deep(tbody tr.info) .type-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #2563eb;
}

.detail-text {
  color: #6b7c93;
}

.empty-row {
  color: #9aacbe !important;
  font-style: italic;
}

/* 모바일 리스트 */
.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-card {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-card.alarm {
  border-left: 3px solid #ef4444;
}

.event-card.warning {
  border-left: 3px solid #f59e0b;
}

.event-card.info {
  border-left: 3px solid #3b82f6;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-type {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-card.alarm .event-type {
  color: #dc2626;
}

.event-card.warning .event-type {
  color: #d97706;
}

.event-card.info .event-type {
  color: #2563eb;
}

.event-time {
  font-size: 11px;
  color: #9aacbe;
}

.event-meta {
  display: flex;
  gap: 6px;
}

.badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.06);
  color: #6b7c93;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

.pagination-mobile {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.page-info {
  font-size: 12px;
  color: #6b7c93;
  min-width: 60px;
  text-align: center;
}

@media (max-width: 768px) {
  .event-table {
    font-size: 12px;
  }

  .col-type {
    width: 80px;
  }

  .col-time {
    width: 120px;
  }

  .col-detail {
    display: none;
  }
}
</style>
