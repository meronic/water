<template>
  <v-card class="comm-card" flat border rounded="lg">
    <div class="comm-header">
      <h3 class="comm-title">탱크 통신 상태</h3>
      <span class="total-count">총 {{ tanks.length }}개</span>
    </div>

    <v-divider />

    <!-- 통신 상태 그리드 -->
    <div class="comm-grid">
      <div
        v-for="tank in commSummary"
        :key="tank.name"
        class="comm-item"
        :class="[tank.statusClass]"
      >
        <div class="item-header">
          <div class="tank-name-badge">{{ tank.name }}</div>
          <div class="status-indicator" :class="[tank.statusClass]" />
        </div>

        <div class="item-stats">
          <div class="stat">
            <span class="label">수신 장비</span>
            <span class="value">{{ tank.received }}/{{ tank.total }}</span>
          </div>
          <div class="stat">
            <span class="label">상태</span>
            <span class="value" :class="[tank.statusClass]">{{ tank.statusText }}</span>
          </div>
        </div>

        <div class="item-time">
          <v-icon icon="mdi-clock-outline" size="14" />
          {{ tank.lastTime || '-' }}
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-if="!tanks.length" class="empty-state">
      <v-icon icon="mdi-wifi-off" size="32" />
      <p>통신 대상이 없습니다</p>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tanks: { type: Array, default: () => [] },
  deviceRows: { type: Array, default: () => [] },
})

// 통신 요약 계산
const commSummary = computed(() => {
  const deviceMap = new Map()

  // 디바이스 데이터를 탱크별로 그룹화
  props.deviceRows.forEach((row) => {
    const tankName = row.tank
    if (!tankName) return

    if (!deviceMap.has(tankName)) {
      deviceMap.set(tankName, {
        total: 0,
        received: 0,
        lastTime: '',
      })
    }

    const stats = deviceMap.get(tankName)
    stats.total += 1
    if (row.receive === '수신') {
      stats.received += 1
    }
    stats.lastTime = getLatestTime(stats.lastTime, row.lastTime)
  })

  // 탱크별로 상태 정보 추가
  return props.tanks.map((tank) => {
    const stats = deviceMap.get(tank.name) || {
      total: 0,
      received: 0,
      lastTime: '',
    }

    let statusClass = 'neutral'
    let statusText = '대기'

    if (stats.total === 0) {
      statusClass = 'neutral'
      statusText = '등록 안됨'
    } else if (stats.received === stats.total) {
      statusClass = 'success'
      statusText = '정상'
    } else if (stats.received > 0) {
      statusClass = 'warning'
      statusText = '부분 수신'
    } else {
      statusClass = 'error'
      statusText = '미수신'
    }

    return {
      name: tank.name,
      ...stats,
      statusClass,
      statusText,
    }
  })
})

// 최신 시간 선택
const getLatestTime = (a, b) => {
  if (!a) return b || ''
  if (!b) return a
  try {
    const aDate = new Date(a)
    const bDate = new Date(b)
    if (!isNaN(aDate) && !isNaN(bDate)) {
      return aDate >= bDate ? a : b
    }
  } catch {
    // fallback to string comparison
  }
  return a >= b ? a : b
}

// 시간 포맷팅
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
</script>

<style scoped>
.comm-card {
  background: rgba(255, 255, 255, 0.96) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.comm-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comm-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0e1a2b;
}

.total-count {
  font-size: 11px;
  color: #9aacbe;
  font-weight: 600;
}

.comm-grid {
  padding: 8px;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}

.comm-item {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s ease;
}

.comm-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.comm-item.success {
  border-left: 3px solid #10b981;
}

.comm-item.warning {
  border-left: 3px solid #f59e0b;
}

.comm-item.error {
  border-left: 3px solid #ef4444;
}

.comm-item.neutral {
  border-left: 3px solid #6b7280;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tank-name-badge {
  font-size: 12px;
  font-weight: 700;
  color: #0e1a2b;
  padding: 3px 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-indicator.success {
  background: #10b981;
}

.status-indicator.warning {
  background: #f59e0b;
}

.status-indicator.error {
  background: #ef4444;
}

.status-indicator.neutral {
  background: #d1d5db;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.item-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat .label {
  font-size: 10px;
  color: #9aacbe;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat .value {
  font-size: 14px;
  font-weight: 700;
  color: #0e1a2b;
}

.stat .value.success {
  color: #059669;
}

.stat .value.warning {
  color: #d97706;
}

.stat .value.error {
  color: #dc2626;
}

.item-time {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #9aacbe;
  padding-top: 3px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: #9aacbe;
}

.empty-state p {
  margin: 8px 0 0 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .comm-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
