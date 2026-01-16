<template>
  <div class="device-wrapper">
    <div v-if="devices.length" class="device-list">
      <div
        v-for="(device, idx) in devices"
        :key="idx"
        class="device-row"
        :class="[getStatus(device)]"
      >
        <div class="device-name">{{ device.name || `장비 ${idx + 1}` }}</div>
        <div class="device-middle">
          <span class="status-text">{{ device.receive || '미수신' }}</span>
        </div>
        <div class="device-time">{{ formatTime(device.lastTime) }}</div>
      </div>
    </div>
    <div v-else class="device-empty">
      <v-icon icon="mdi-alert-outline" size="20" />
      <span>등록된 장비가 없습니다</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

defineProps({
  devices: { type: Array, default: () => [] },
  tank_name: { type: String, required: true },
})

// 상태 클래스 가져오기
const getStatus = (device) => {
  return device.receive === '수신' ? 'active' : 'inactive'
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
.device-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-row {
  display: grid;
  grid-template-columns: 120px 60px 60px;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid #d1d5db;
  background: rgba(0, 0, 0, 0.02);
  font-size: 12px;
  transition: all 0.2s ease;
}

.device-row.active {
  border-left-color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.device-row.inactive {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.device-name {
  font-weight: 600;
  color: #0e1a2b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-middle {
  text-align: center;
}

.status-text {
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.device-row.active .status-text {
  background: rgba(16, 185, 129, 0.2);
  color: #059669;
}

.device-row.inactive .status-text {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.device-time {
  text-align: right;
  color: #9aacbe;
  font-family: 'Courier New', monospace;
}

.device-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #9aacbe;
  font-size: 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.02);
}

@media (max-width: 640px) {
  .device-row {
    grid-template-columns: 1fr 60px 60px;
  }
}
</style>
