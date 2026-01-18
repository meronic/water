<!-- components/WaterDepthVisualizer.vue -->
<template>
  <div class="water-depth-box">
    <div class="water-container">
      <div
        class="water-fill"
        :style="{ height: waterHeight + '%' }"
      />
      <div class="water-label">
        {{ currentHeight.toFixed(1) }} m
      </div>
    </div>
    <div class="water-info">
      <p>{{ actualVolume }} / {{ targetVolume }} m³</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  targetVolume: { type: Number, required: true },   // 목표값
  actualVolume: { type: Number, required: true },   // 실적값
  squareSize: { type: Number, default: 10 },        // 정사각형 한 변 (m)
})

const area = props.squareSize ** 2
const currentHeight = props.actualVolume / area
const maxHeight = props.targetVolume / area
const waterHeight = (currentHeight / maxHeight) * 100
</script>

<style scoped>
.water-depth-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  font-size: 12px;
  color: #ccc;
}

.water-container {
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid #ccc;
  background-color: #1a1a1a;
  overflow: hidden;
}

.water-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: #3b82f6;
  transition: height 0.5s ease;
}

.water-label {
  position: absolute;
  top: 4px;
  width: 100%;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  color: white;
}

.water-info {
  margin-top: 4px;
  text-align: center;
}
</style>
