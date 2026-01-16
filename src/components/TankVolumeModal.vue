<template>
  <v-dialog v-model="modelValue" max-width="500px">
    <v-card>
      <v-card-title class="bg-primary text-white pa-4">
        탱크 부피 정보
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate />
        </div>

        <div v-else class="volume-form">
          <div class="form-group">
            <label class="form-label">탱크명</label>
            <p class="form-value">{{ tankInfo?.tank_name || '-' }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">선박</label>
            <p class="form-value">{{ tankInfo?.ship_no || '-' }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">최대 높이 (m)</label>
            <p class="form-value">{{ tankInfo?.max_height?.toFixed(2) || '0.00' }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">최대 부피 (m³)</label>
            <p class="form-value">{{ tankInfo?.max_volume?.toFixed(2) || '0.00' }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">설치 위치</label>
            <p class="form-value">{{ tankInfo?.location || '-' }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">마지막 수정</label>
            <p class="form-value">{{ formatDateTime(tankInfo?.updated_at) }}</p>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn text @click="$emit('close')">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  tankId: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue', 'close'])

const loading = ref(false)
const tankInfo = ref(null)

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 시간 포맷팅
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

import { computed } from 'vue'

// 탱크 정보 로드 시뮬레이션
watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      loading.value = true
      // 실제 API 호출은 필요시 추가
      setTimeout(() => {
        tankInfo.value = {
          tank_name: props.tankId,
          ship_no: '선박1',
          max_height: 3.5,
          max_volume: 150,
          location: '메인 데크',
          updated_at: new Date().toISOString(),
        }
        loading.value = false
      }, 500)
    }
  }
)
</script>

<style scoped>
.volume-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7c93;
}

.form-value {
  margin: 0;
  font-size: 14px;
  color: #0e1a2b;
  font-weight: 500;
}
</style>
