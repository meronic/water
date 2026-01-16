<template>
  <div class="tank-status-board">
    <div class="tank-header">
      <div class="title-group">
        <span class="tank-id">{{ tankId }}</span>
        <div class="comm-status" :class="{ 'is-online': isOnline }">
          <div class="status-dot"></div>
          {{ isOnline ? 'Online' : 'Offline' }}
        </div>
      </div>
      <div class="status-badge" :class="statusClass">
        {{ statusText }}
      </div>
    </div>

    <div class="tank-main-layout">
      <div class="visualization-container">
        <div class="tank-wrapper">
          <div class="water-percent-display">
            <span class="percent-val">{{ heightPercent }}</span>
            <span class="percent-unit">%</span>
          </div>

          <svg class="tank-svg" viewBox="0 0 140 260">
            <defs>
              <linearGradient id="tankWaterGradient" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="0%" stop-color="#34d399" />
                <stop offset="100%" stop-color="#3b82f6" />
              </linearGradient>
              <filter id="innerShadow">
                <feOffset dx="0" dy="2" />
                <feGaussianBlur stdDeviation="3" result="offset-blur" />
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                <feFlood flood-color="black" flood-opacity="0.2" result="color" />
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                <feComponentTransfer in="shadow" result="shadow">
                  <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="shadow" />
                </feMerge>
              </filter>
            </defs>

            <rect x="20" y="40" width="100" height="200" rx="15" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" class="tank-body" />
            
            <g class="tank-scale" stroke="#94a3b8" stroke-width="1">
              <line v-for="i in 11" :key="i" x1="110" :y1="40 + (i-1)*20" x2="120" :y2="40 + (i-1)*20" />
            </g>

            <g clip-path="inset(0% 0% 0% 0% round 15px)">
              <rect 
                x="20" 
                :y="240 - (200 * (heightPercent/100))" 
                width="100" 
                :height="200 * (heightPercent/100)" 
                fill="url(#tankWaterGradient)"
                class="water-rect"
              />
              <path :d="wavePathCurved" fill="white" opacity="0.3" class="wave-animation" />
            </g>

            <rect x="30" y="50" width="15" height="180" rx="5" fill="white" opacity="0.2" />
          </svg>
        </div>

        <div class="tank-data-grid">
          <div class="data-item">
            <span class="label">현재 수위</span>
            <span class="value">{{ currentHeight.toFixed(2) }}<small>m</small></span>
          </div>
          <div class="data-item">
            <span class="label">최대 용량</span>
            <span class="value">{{ maxHeight.toFixed(1) }}<small>m</small></span>
          </div>
        </div>
      </div>

      <div class="flow-control-section">
        <h4 class="section-title">PUMP MONITORING</h4>
        <div class="pump-grid">
          <div v-for="(flow, idx) in flowData" :key="idx" class="pump-card">
            <div class="pump-header">
              <span class="pump-name">{{ flow.name }}</span>
              <span class="pump-status-dot" :class="{ 'is-running': flow.speed > 0 }"></span>
            </div>
            
            <div class="gauge-wrapper">
              <svg viewBox="0 0 100 60" class="mini-gauge">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" stroke-width="8" stroke-linecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" :stroke="flowColor(flow.speed)" stroke-width="8" stroke-linecap="round"
                  :stroke-dasharray="251" :stroke-dashoffset="251 - (125 * (flow.speed / flow.max))"
                  style="transition: stroke-dashoffset 0.5s ease" />
              </svg>
              <div class="gauge-center">
                <span class="flow-val">{{ flow.speed.toFixed(0) }}</span>
                <span class="flow-unit">L/min</span>
              </div>
            </div>

            <div class="pump-footer">
              <div class="stat">
                <label>ACCUM.</label>
                <span>1,240 L</span>
              </div>
              <div class="stat">
                <label>LOAD</label>
                <span>{{ ((flow.speed / flow.max) * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tank-footer">
      <span class="update-time">Last update: {{ lastUpdateTime }}</span>
    </div>
  </div>
</template>

<style scoped>
.tank-status-board {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 480px;
}

.theme-dark .tank-status-board {
  background: rgba(18, 23, 30, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* 헤더 디자인 */
.tank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tank-id {
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}

.theme-dark .tank-id {
  color: #f0f6ff;
}

.comm-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #cbd5e1;
  border-radius: 50%;
}

.comm-status.is-online {
  color: #10b981;
}

.comm-status.is-online .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

/* 메인 레이아웃 */
.tank-main-layout {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
  align-items: stretch;
}

/* 탱크 시각화 */
.visualization-container {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
  border-radius: 10px;
}

.tank-wrapper {
  position: relative;
  width: 180px;
  height: 300px;
}

.water-percent-display {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  text-align: center;
  z-index: 10;
  pointer-events: none;
}

.percent-val {
  font-size: 42px;
  font-weight: 900;
  color: #ffffff;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
  display: block;
  line-height: 1.1;
}

.percent-unit {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
}

.tank-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
}

.water-rect {
  transition: y 0.6s ease-in-out, height 0.6s ease-in-out;
}

.tank-data-grid {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  text-align: center;
  flex: 1;
}

.data-item .label {
  font-size: 10px;
  color: #7a8a9f;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-item .value {
  font-size: 16px;
  font-weight: 800;
  color: #0e1a2b;
}

.theme-dark .data-item .value {
  color: #f0f6ff;
}

.data-item small {
  font-size: 10px;
  color: #7a8a9f;
  margin-left: 1px;
  font-weight: 600;
}

/* 펌프/유량계 섹션 */
.flow-control-section {
  flex: 0.8;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  justify-content: flex-start;
}

.section-title {
  font-size: 10px;
  color: #7a8a9f;
  letter-spacing: 0.1em;
  margin: 0;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.pump-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.pump-card {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 11px;
  transition: all 0.2s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-height: 200px;
}

.theme-dark .pump-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.04);
}

.pump-card:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.3);
}

.pump-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pump-name {
  font-size: 12px;
  font-weight: 700;
  color: #0e1a2b;
}

.theme-dark .pump-name {
  color: #f0f6ff;
}

.pump-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.3s ease;
}

.pump-status-dot.is-running {
  background: #3b82f6;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
}

.gauge-wrapper {
  position: relative;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 0;
}

.mini-gauge {
  width: 100%;
  height: 100%;
  max-width: 140px;
  max-height: 80px;
}

.gauge-center {
  position: absolute;
  text-align: center;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.flow-val {
  font-size: 18px;
  font-weight: 800;
  color: #0e1a2b;
  display: block;
  line-height: 1;
}

.theme-dark .flow-val {
  color: #f0f6ff;
}

.flow-unit {
  font-size: 11px;
  color: #7a8a9f;
  font-weight: 600;
}

.pump-footer {
  display: flex;
  justify-content: space-around;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 11px;
  gap: 8px;
}

.theme-dark .pump-footer {
  border-top-color: rgba(255, 255, 255, 0.05);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
}

.stat label {
  font-size: 9px;
  color: #7a8a9f;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat span {
  font-size: 13px;
  font-weight: 700;
  color: #0e1a2b;
}

.theme-dark .stat span {
  color: #f0f6ff;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-normal {
  background: rgba(16, 185, 129, 0.2);
  color: #059669;
}

.status-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #d97706;
}

.status-empty {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.tank-footer {
  margin-top: 8px;
  font-size: 10px;
  color: #7a8a9f;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 8px;
}

.theme-dark .tank-footer {
  border-top-color: rgba(255, 255, 255, 0.05);
}

/* 반응형 */
@media (max-width: 768px) {
  .tank-status-board {
    padding: 14px;
    min-height: 420px;
  }

  .tank-main-layout {
    gap: 12px;
  }

  .visualization-container {
    flex: 1.1;
    padding: 12px;
    gap: 10px;
  }

  .tank-wrapper {
    width: 140px;
    height: 240px;
  }

  .percent-val {
    font-size: 32px;
  }

  .percent-unit {
    font-size: 13px;
  }

  .tank-data-grid {
    gap: 12px;
    padding: 6px 10px;
  }

  .data-item .value {
    font-size: 14px;
  }

  .flow-control-section {
    flex: 0.9;
  }

  .pump-card {
    padding: 10px;
    min-height: 180px;
  }

  .pump-name {
    font-size: 11px;
  }

  .gauge-wrapper {
    height: 65px;
  }

  .mini-gauge {
    max-width: 110px;
    max-height: 65px;
  }
}

@media (max-width: 480px) {
  .tank-status-board {
    padding: 12px;
    min-height: 340px;
  }

  .tank-main-layout {
    flex-direction: column;
    gap: 12px;
  }

  .visualization-container {
    flex: 1;
    padding: 12px;
    gap: 10px;
  }

  .tank-wrapper {
    width: 120px;
    height: 200px;
  }

  .percent-val {
    font-size: 28px;
  }

  .percent-unit {
    font-size: 12px;
  }

  .tank-data-grid {
    gap: 10px;
    padding: 6px 8px;
  }

  .data-item {
    gap: 3px;
  }

  .data-item .value {
    font-size: 12px;
  }

  .flow-control-section {
    flex: 1;
    gap: 10px;
  }

  .pump-grid {
    gap: 10px;
  }

  .pump-card {
    padding: 10px;
    min-height: 160px;
  }

  .gauge-wrapper {
    height: 55px;
  }

  .mini-gauge {
    max-width: 100px;
    max-height: 55px;
  }
}
</style>

<script setup>
// 기존 Logic을 그대로 유지하되, 디자인 요소에 맞춰 변수 매핑만 최적화
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  tankId: { type: String, default: 'BALLAST TANK 01' },
  devices: { type: Array, default: () => [] }
})

const currentHeight = ref(7.5) // 시뮬레이션 데이터
const maxHeight = ref(10.0)
const lastUpdateTime = ref(new Date().toLocaleTimeString())
const isOnline = ref(true)

const heightPercent = computed(() => {
  return Math.round((currentHeight.value / maxHeight.value) * 100)
})

const flowData = ref([
  { name: 'INLET PUMP', speed: 320, max: 500 },
  { name: 'OUTLET PUMP', speed: 0, max: 500 }
])

const statusClass = computed(() => {
  if (heightPercent.value > 80) return 'status-normal'
  if (heightPercent.value > 20) return 'status-warning'
  return 'status-empty'
})

const statusText = computed(() => {
  if (heightPercent.value > 80) return 'FULL'
  if (heightPercent.value > 20) return 'NORMAL'
  return 'LOW'
})

const flowColor = (speed) => speed > 0 ? '#3b82f6' : '#cbd5e1'

// 파도 애니메이션 경로 (단순화된 예시)
const wavePathCurved = computed(() => {
  const y = 240 - (200 * (heightPercent.value/100))
  return `M 20 ${y} Q 70 ${y-10} 120 ${y} L 120 240 L 20 240 Z`
})
</script>
