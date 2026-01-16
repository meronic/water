<template>
  <div class="water-depth-card">
    <div class="water-container">
      <div class="water-fill" :style="{ height: waterHeight + '%' }" />
      <div class="water-label">{{ currentHeight.toFixed(1) }} m</div>
    </div>
    <div class="water-info">
      {{ actualVolume }} / {{ targetVolume }} m³
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  targetVolume: { type: Number, required: true }, // 목표 체적
  actualVolume: { type: Number, required: true }, // 현재 체적
  squareSize: { type: Number, default: 10 }, // 한 변 길이(m)
})

const area = computed(() => props.squareSize ** 2)
const currentHeight = computed(() => (props.actualVolume / area.value) || 0)
const maxHeight = computed(() => (props.targetVolume / area.value) || 1)
const waterHeight = computed(() => {
  const percent = (currentHeight.value / maxHeight.value) * 100
  return Math.min(100, Math.max(0, percent))
})
</script>

<style scoped>
.water-depth-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 220px;
  font-size: 12px;
  color: #cbd5f5;
}

.water-container {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: 12px;
  border: 2px solid rgba(148, 163, 184, 0.5);
  background-color: rgba(15, 23, 42, 0.8);
  overflow: hidden;
}

.water-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(180deg, #60a5fa, #2563eb);
  transition: height 0.5s ease;
}

.water-label {
  position: absolute;
  top: 6px;
  width: 100%;
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  color: white;
}

.water-info {
  margin-top: 6px;
  text-align: center;
}

@media (max-width: 600px) {
  .water-container {
    height: 140px;
  }
}
</style>
