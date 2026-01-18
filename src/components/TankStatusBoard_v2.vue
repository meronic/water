<template>
  <div v-if="tank" class="tank-card-v2" :class="[isDark ? 'dark-mode' : 'light-mode']">
    <!-- ================= Header ================= -->
    <div class="header-section">
      <div class="tank-header">
        <h2 class="tank-name">{{ tank.name }}</h2>
        <div class="status-badge" :class="`status-${tankStatus.level}`">
          <span class="status-icon">{{ tankStatus.icon }}</span>
          <span class="status-text">{{ tankStatus.label }}</span>
        </div>
      </div>

      <div class="quick-stats">
        <div class="stat-item">
          <span class="stat-label">수위</span>
          <span class="stat-value">{{ currentHeight?.toFixed(2) }} m</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">목표</span>
          <span class="stat-value">{{ tank.goal }} m³</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">달성률</span>
          <span class="stat-value achievement" :class="tankStatus.level">{{ status }}%</span>
        </div>
      </div>
    </div>

    <!-- ================= Gauge + Flow ================= -->
    <div class="gauge-and-flow-container">
      <!-- ================= OPEN-TOP BEAKER TANK (UPDATED) ================= -->
      <div class="gauge-section industrial">
        <div class="gauge-label industrial">
          누적 주수량:
          <strong>{{ Number(tank.actual)?.toFixed(1) }}</strong> m³ / 목표:
          <strong>{{ tank.goal }}</strong> m³
        </div>

        <div class="tank-visualization">
          <!-- ✅ 비커 오픈탑 탱크 + 출렁임 + 기포 -->
          <svg
            viewBox="0 0 320 260"
            class="tank-svg beaker-tank"
            :class="isFlowing ? 'is-flowing' : 'is-still'"
            role="img"
            aria-label="Open top beaker water tank level"
          >
            <defs>
              <!-- ===== Materials ===== -->
              <linearGradient id="tankWall" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#07101f" stop-opacity="0.96" />
                <stop offset="18%" stop-color="#23324a" stop-opacity="0.92" />
                <stop offset="55%" stop-color="#0a1226" stop-opacity="0.98" />
                <stop offset="82%" stop-color="#23324a" stop-opacity="0.92" />
                <stop offset="100%" stop-color="#07101f" stop-opacity="0.96" />
              </linearGradient>

              <linearGradient id="tankInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0b1226" stop-opacity="0.92" />
                <stop offset="100%" stop-color="#030614" stop-opacity="0.98" />
              </linearGradient>

              <linearGradient id="tankRim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(226,232,240,0.55)" />
                <stop offset="100%" stop-color="rgba(2,6,23,0.60)" />
              </linearGradient>

              <linearGradient id="glassHighlight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="rgba(255,255,255,0)" />
                <stop offset="40%" stop-color="rgba(255,255,255,0.16)" />
                <stop offset="65%" stop-color="rgba(255,255,255,0.06)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0)" />
              </linearGradient>

              <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#76f3ff" stop-opacity="0.78" />
                <stop offset="55%" stop-color="#2aa0ff" stop-opacity="0.92" />
                <stop offset="100%" stop-color="#114fff" stop-opacity="0.96" />
              </linearGradient>

              <linearGradient id="waterShine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.0" />
                <stop offset="45%" stop-color="#ffffff" stop-opacity="0.18" />
                <stop offset="75%" stop-color="#ffffff" stop-opacity="0.06" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
              </linearGradient>

              <!-- ===== Shadow ===== -->
              <filter id="tankShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
                <feOffset dx="0" dy="7" result="off" />
                <feColorMatrix
                  in="off"
                  type="matrix"
                  values="0 0 0 0 0
                          0 0 0 0 0
                          0 0 0 0 0
                          0 0 0 0.35 0"
                />
                <feComposite in2="SourceGraphic" operator="over" />
              </filter>

              <!-- ===== Beaker cavity clip (OPEN TOP) ===== -->
              <clipPath id="tankCavityClip">
                <!-- inner cavity (slightly tapered + rounded bottom) -->
                <path
                  d="M86 58
                     Q86 44 100 44
                     H220
                     Q234 44 234 58
                     V204
                     Q234 228 212 236
                     H108
                     Q86 228 86 204
                     Z"
                />
              </clipPath>
            </defs>

            <!-- ===== ground shadow ===== -->
            <ellipse cx="160" cy="244" rx="116" ry="12" class="tank-ground-shadow" />

            <!-- ===== Tank body (beaker) ===== -->
            <g filter="url(#tankShadow)">
              <!-- Outer beaker shell (wide + tapered + rounded bottom) -->
              <path
                d="M64 62
                   Q64 22 108 22
                   H212
                   Q256 22 256 62
                   V212
                   Q256 252 212 256
                   H108
                   Q64 252 64 212
                   Z"
                class="tank-shell"
                fill="url(#tankWall)"
              />

              <!-- Inner cavity -->
              <path
                d="M86 58
                   Q86 44 100 44
                   H220
                   Q234 44 234 58
                   V204
                   Q234 228 212 236
                   H108
                   Q86 228 86 204
                   Z"
                class="tank-inner"
                fill="url(#tankInner)"
                opacity="0.98"
              />

              <!-- ✅ Open-top rim (beaker lip only) - 입구 타원 제거 -->
              <path
                d="M68 62
                   Q72 34 112 34
                   H208
                   Q248 34 252 62"
                class="tank-rim-front"
                stroke="url(#tankRim)"
              />

              <!-- Inner rim highlight -->
              <path
                d="M88 64
                   Q92 48 120 48
                   H200
                   Q228 48 232 64"
                class="tank-rim-highlight"
              />

              <!-- Glass-ish vertical highlight -->
              <rect
                x="122"
                y="38"
                width="60"
                height="210"
                class="glass-highlight"
                fill="url(#glassHighlight)"
                opacity="0.45"
              />

              <!-- Bolts on rim -->
              <g class="rim-rivets">
                <circle v-for="p in rivetPoints" :key="p.id" :cx="p.x" :cy="p.y" r="2.7" />
              </g>

              <!-- Stiffeners (shipyard feel) -->
              <g class="stiffeners">
                <path d="M96 92 V216" />
                <path d="M122 80 V226" />
                <path d="M198 80 V226" />
                <path d="M224 92 V216" />
              </g>

              <!-- Weld seam -->
              <path
                d="M92 156
                   C 120 176, 140 144, 164 162
                   C 186 178, 206 150, 238 174"
                class="weld-seam"
              />
            </g>

            <!-- ===== Water (clipped to cavity) ===== -->
            <g clip-path="url(#tankCavityClip)">
              <g class="water-group" :style="{ transform: `translateY(${waterOffsetPx}px)` }">
                <rect x="86" y="0" width="148" height="260" fill="url(#waterFill)" opacity="0.95" />

                <!-- surface slosh pack -->
                <g class="surface-pack">
                  <path
                    d="M34 86
                       C 74 58, 108 112, 148 86
                       C 188 60, 220 112, 260 86
                       C 300 58, 332 112, 372 86
                       L372 260 L34 260 Z"
                    class="water-surface wave-1"
                    fill="rgba(255,255,255,0.20)"
                  />
                  <path
                    d="M34 100
                       C 70 84, 104 108, 140 100
                       C 176 92, 210 116, 246 100
                       C 282 84, 316 108, 352 100
                       L352 260 L34 260 Z"
                    class="water-surface wave-2"
                    fill="rgba(255,255,255,0.14)"
                  />
                </g>

                <rect
                  x="136"
                  y="108"
                  width="52"
                  height="150"
                  fill="url(#waterShine)"
                  opacity="0.55"
                  class="water-shine"
                />
              </g>

              <!-- bubbles: always a little, flowing is stronger -->
              <g class="bubbles" :class="isFlowing ? 'strong' : 'weak'">
                <circle class="bubble b1" cx="116" cy="240" r="2.4" />
                <circle class="bubble b2" cx="138" cy="248" r="2.0" />
                <circle class="bubble b3" cx="158" cy="244" r="2.8" />
                <circle class="bubble b4" cx="182" cy="252" r="1.9" />
                <circle class="bubble b5" cx="206" cy="246" r="2.3" />

                <circle class="bubble b6" cx="126" cy="258" r="1.8" />
                <circle class="bubble b7" cx="150" cy="262" r="2.2" />
                <circle class="bubble b8" cx="172" cy="260" r="1.7" />
                <circle class="bubble b9" cx="196" cy="264" r="2.0" />
                <circle class="bubble b10" cx="108" cy="264" r="1.6" />
              </g>
            </g>

            <!-- outline -->
            <path
              d="M64 62
                 Q64 22 108 22
                 H212
                 Q256 22 256 62
                 V212
                 Q256 252 212 256
                 H108
                 Q64 252 64 212
                 Z"
              class="tank-outline"
            />

            <!-- scale ticks -->
            <g class="scale">
              <line x1="268" y1="78" x2="292" y2="78" />
              <line x1="268" y1="112" x2="292" y2="112" />
              <line x1="268" y1="146" x2="292" y2="146" />
              <line x1="268" y1="180" x2="292" y2="180" />
              <line x1="268" y1="214" x2="292" y2="214" />
            </g>

            <!-- HUD -->
            <text x="160" y="176" class="percent" text-anchor="middle">
              {{ status }}%
            </text>
          </svg>
        </div>

        <div class="gauge-info industrial">
          <span v-if="isFlowing" class="flowing-indicator">🛠️ 작업중 (실시간 주수)</span>
          <span v-else class="stopped-indicator">⏸ 대기중 (주수 정지)</span>
        </div>
      </div>

      <!-- ================= Flow Meters (NEW DESIGN v4) ================= -->
      <div class="flow-meters-section v4">
        <div class="flow-table-title v4">
          <span class="title-icon">🧪</span>
          유량계 실시간 상태
          <span class="title-sub">FLOW METERS</span>
        </div>

        <div class="flow-meters-grid v4">
          <div
            v-for="(device, idx) in flowMetersDisplay"
            :key="device.device_uuid"
            class="fm-card"
            :class="[
              `st-${device.status}`,
              device.receive === '수신' ? 'rx-ok' : 'rx-fail',
              device.current_flow > 0 ? 'is-flowing' : 'is-stopped'
            ]"
            :style="{
              '--spin': `${device.spinMs}ms`,
              '--pipe': `${device.pipeMs}ms`,
              '--flow': `${Math.min(100, Math.max(0, (device.current_flow || 0) / 2))}%`
            }"
          >
            <!-- Left : hardware visual -->
            <div class="fm-left">
              <div class="fm-badge-row">
                <div class="fm-unit">UNIT #{{ idx + 1 }}</div>
                <div class="fm-rx" :class="device.receive === '수신' ? 'ok' : 'fail'">
                  <span class="dot"></span>
                  {{ device.receive === '수신' ? 'RX OK' : 'NO RX' }}
                </div>
              </div>

              <div class="fm-pipe-wrap">
                <div class="fm-pipe-wrap">
                  <div class="fm-pipe">
                    <div class="fm-pipe-bg"></div>
                    <div class="fm-pipe-flow"></div>
                    <div class="fm-pipe-bubbles" v-if="device.current_flow > 0">
                      <span class="b b1"></span><span class="b b2"></span><span class="b b3"></span>
                    </div>
                  </div>

                  <div class="fm-meter">
                    <svg viewBox="0 0 64 64" class="fm-impeller">
                      <defs>
                        <radialGradient :id="`impGrad-${idx}`" cx="50%" cy="40%" r="60%">
                          <stop offset="0%" stop-color="rgba(255,255,255,0.8)" />
                          <stop offset="60%" stop-color="rgba(255,255,255,0.15)" />
                          <stop offset="100%" stop-color="rgba(0,0,0,0.35)" />
                        </radialGradient>
                      </defs>

                      <circle cx="32" cy="32" r="28" class="rim" />
                      <circle cx="32" cy="32" r="22" class="glass" :fill="`url(#impGrad-${idx})`" />

                      <g class="blades">
                        <path d="M32 10 L38 30 L32 34 L26 30 Z" />
                        <path d="M32 10 L38 30 L32 34 L26 30 Z" transform="rotate(90 32 32)" />
                        <path d="M32 10 L38 30 L32 34 L26 30 Z" transform="rotate(180 32 32)" />
                        <path d="M32 10 L38 30 L32 34 L26 30 Z" transform="rotate(270 32 32)" />
                      </g>

                      <circle cx="32" cy="32" r="4.5" class="hub" />
                    </svg>

                    <div class="fm-state">
                      <span class="pill on" v-if="device.current_flow > 0">FLOW</span>
                      <span class="pill off" v-else>STOP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="fm-bar">
                <div class="fm-bar-label">유량 강도</div>
                <div class="fm-bar-track">
                  <div class="fm-bar-fill"></div>
                </div>
              </div>
            </div>

            <!-- Right : values -->
            <div class="fm-right">
              <div class="fm-title">
                <span class="led" :class="device.current_flow > 0 ? 'on' : 'off'"></span>
                유량계 상태
              </div>

              <div class="fm-row big">
                <div class="k">현재 유량</div>
                <div class="v">
                  {{ device.current_flow?.toFixed(1) ?? 0 }}
                  <span class="u">톤</span>
                </div>
              </div>

              <div class="fm-row">
                <div class="k">장비 상태</div>
                <div class="v2" :class="device.status">
                  {{ device.status === 'normal' ? 'ON' : 'OFF' }}
                </div>
              </div>

              <div class="fm-row">
                <div class="k">마지막 수신</div>
                <div class="v3">{{ device.lastTime }}</div>
              </div>

              <div class="fm-mini-hint">
                <span class="hint-dot"></span>
                유량이 높을수록 임펠러/파이프 속도가 빨라집니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= Graphs ================= -->
    <div class="graph-section">
      <div class="graph-card">
        <div class="graph-title">누적 주수 현황</div>
        <GraphPanel type="accumulated" :tankId="tank.name" :goalValue="tank.goal" from="dashboard" interval="1h" />
      </div>
      <div class="graph-card">
        <div class="graph-title">시간당 유량 변화</div>
        <GraphPanel type="hourly" :tankId="tank.name" :goalValue="tank.goal" from="dashboard" interval="1h" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from 'vuetify'
import GraphPanel from '@/components/GraphPanel.vue'
import { useShipStore } from '@/stores/shipStore'
import { estimateTankHeight, getTankMaxHeight } from '@/api/tankVolume'

const props = defineProps({
  tankId: { type: String, required: true },
  devices: { type: Array, default: () => [] },
  tank: { type: Object, required: false },
})

const shipStore = useShipStore()
const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)

const currentHeight = ref(0)
const maxHeight = ref(1)
let tankInterval = null

// ✅ 림이 커진 비커에 맞춰 rivet 위치 조정
const rivetPoints = [
  { id: 1, x: 104, y: 64 }, { id: 2, x: 120, y: 64 }, { id: 3, x: 136, y: 64 }, { id: 4, x: 152, y: 64 },
  { id: 5, x: 168, y: 64 }, { id: 6, x: 184, y: 64 }, { id: 7, x: 200, y: 64 }, { id: 8, x: 216, y: 64 },
]

// ===== 원본 로직 유지 =====
const tankList = computed(() => {
  const ship = shipStore.shipList.find(s => s.name === shipStore.selectedShip)
  return ship ? ship.tank : []
})

const tank = computed(() => tankList.value.find(t => t.name === props.tankId) || null)

const status = computed(() => {
  if (!tank.value || !tank.value.goal) return 0
  return Math.round((tank.value.actual / tank.value.goal) * 100)
})

const tankStatus = computed(() => {
  const percentage = status.value
  if (percentage >= 90) return { level: 'error', icon: '⚠️', label: '이상' }
  else if (percentage >= 70) return { level: 'warning', icon: '⚡', label: '경고' }
  else return { level: 'normal', icon: '✓', label: '정상' }
})

const isFlowing = computed(() => (tank.value?.flow ?? 0) > 0)

// ✅ NEW cavity 기준으로 water offset 계산
const waterOffsetPx = computed(() => {
  const p = Math.max(0, Math.min(100, status.value || 0))
  const innerTop = 44
  const innerBottom = 236
  const innerH = innerBottom - innerTop // 192
  const fillTopY = innerTop + (innerH * (100 - p) / 100)
  // wave baseline(y=86) 기준 정렬
  return Math.round(fillTopY - 86)
})

// ===== (유량계 로직 유지) =====
const getFlowInTons = () => {
  const baseFlow = tank.value?.flow ?? 0
  if (baseFlow === 0) return 0
  const tons = 125 + (Math.random() - 0.5) * 50
  return Math.max(100, Math.min(150, tons))
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const toSpinMs = (flow) => {
  if (!flow || flow <= 0) return 0
  const f = clamp(flow, 80, 180)
  return Math.round(1800 - (f - 80) * 12)
}
const toPipeMs = (flow) => {
  if (!flow || flow <= 0) return 0
  const f = clamp(flow, 80, 180)
  return Math.round(1400 - (f - 80) * 7)
}

const flowMetersDisplay = computed(() => {
  const flowInTons = getFlowInTons()
  const meters = (props.devices || []).slice(0, 2).map((d, idx) => {
    const current_flow = flowInTons + (idx === 1 ? -2 : 1)
    return {
      device_uuid: d.device_uuid || `device-${idx}`,
      status: d.status || 'normal',
      current_flow,
      receive: d.receive || '수신',
      lastTime: d.lastTime || '-',
      spinMs: toSpinMs(current_flow),
      pipeMs: toPipeMs(current_flow),
    }
  })

  if (meters.length === 1) {
    const current_flow = meters[0].current_flow - 2
    meters.push({
      device_uuid: 'device-2',
      status: meters[0].status,
      current_flow,
      receive: meters[0].receive,
      lastTime: meters[0].lastTime,
      spinMs: toSpinMs(current_flow),
      pipeMs: toPipeMs(current_flow),
    })
  }

  if (meters.length === 0) {
    const t = new Date().toLocaleTimeString('ko-KR', { hour12: false })
    const f1 = flowInTons + 1
    const f2 = flowInTons - 2
    return [
      { device_uuid: 'uuid-001', status: 'normal', current_flow: f1, receive: '수신', lastTime: t, spinMs: toSpinMs(f1), pipeMs: toPipeMs(f1) },
      { device_uuid: 'uuid-002', status: 'normal', current_flow: f2, receive: '수신', lastTime: t, spinMs: toSpinMs(f2), pipeMs: toPipeMs(f2) },
    ]
  }
  return meters
})

const fetchTankHeight = async () => {
  if (!tank.value || !tank.value.actual) return
  try {
    const height = await estimateTankHeight({
      ship_no: shipStore.selectedShip,
      tank_name: tank.value.name,
      current_volume: tank.value.actual,
    })
    if (height && height.currentheight) currentHeight.value = height.currentheight

    const maxheight = await getTankMaxHeight({
      ship_no: shipStore.selectedShip,
      tank_name: tank.value.name
    })
    maxHeight.value = (maxheight && maxheight.maxheight) ? maxheight.maxheight : 1
  } catch (e) {
    console.error('수위 계산 실패:', e)
  }
}

onMounted(() => {
  if (shipStore.selectedShip) {
    shipStore.syncLatestTankDataFromApi(shipStore.selectedShip)
    tankInterval = setInterval(() => shipStore.syncLatestTankDataFromApi(shipStore.selectedShip), 10000)
    fetchTankHeight()
  }
})

onUnmounted(() => { if (tankInterval) clearInterval(tankInterval) })
</script>

<style scoped>
/* ========== Layout base ========== */
.tank-card-v2 {
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.3s ease;
}

.light-mode { background-color: #ffffff; color: #334155; border: 1px solid #e2e8f0; }
.dark-mode { background-color: #0b1220; color: #f1f5f9; border: 1px solid #223047; }

/* Header */
.header-section { display: flex; justify-content: space-between; align-items: flex-end; }
.tank-header { display: flex; align-items: center; gap: 12px; }
.tank-name { font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 0.02em; }
.status-badge { padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 900; }
.status-normal { background: #dcfce7; color: #166534; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-error { background: #fee2e2; color: #991b1b; }

.quick-stats { display: flex; gap: 24px; }
.stat-item { display: flex; flex-direction: column; align-items: flex-end; }
.stat-label { font-size: 11px; opacity: 0.6; font-weight: 800; }
.stat-value { font-size: 20px; font-weight: 900; }
.achievement.normal { color: #3b82f6; }
.achievement.warning { color: #f59e0b; }
.achievement.error { color: #ef4444; }

/* Grid */
.gauge-and-flow-container { display: grid; grid-template-columns: 1fr 1.8fr; gap: 24px; }

/* Gauge panel */
.gauge-section.industrial {
  background: linear-gradient(180deg, rgba(2,6,23,0.06), rgba(2,6,23,0.02));
  padding: 18px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(2,6,23,0.08);
}
.dark-mode .gauge-section.industrial {
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  border-color: rgba(255,255,255,0.06);
}
.gauge-label.industrial { font-size: 12px; font-weight: 900; opacity: 0.78; margin-bottom: 10px; }

.tank-visualization { display: grid; place-items: center; }

/* ================== TANK (BEAKER) ================== */
.tank-svg.beaker-tank { width: 280px; max-width: 100%; }

.tank-ground-shadow { fill: rgba(2,6,23,0.22); }
.dark-mode .tank-ground-shadow { fill: rgba(0,0,0,0.58); }

.tank-shell { stroke: rgba(148,163,184,0.16); stroke-width: 2.6; }
.tank-inner { stroke: rgba(226,232,240,0.05); stroke-width: 2; }

.tank-rim-front {
  fill: none;
  stroke-width: 9;
  stroke-linecap: round;
  opacity: 0.92;
}
.tank-rim-highlight {
  fill: none;
  stroke: rgba(255,255,255,0.12);
  stroke-width: 3.8;
  stroke-linecap: round;
}

.glass-highlight {
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.35;
}
.dark-mode .glass-highlight { opacity: 0.28; }

.rim-rivets circle {
  fill: rgba(203,213,225,0.86);
  stroke: rgba(2,6,23,0.55);
  stroke-width: 1;
  opacity: 0.96;
}
.dark-mode .rim-rivets circle {
  fill: rgba(226,232,240,0.70);
  stroke: rgba(0,0,0,0.45);
}

.stiffeners path {
  fill: none;
  stroke: rgba(226,232,240,0.10);
  stroke-width: 3.2;
  stroke-linecap: round;
}
.dark-mode .stiffeners path { stroke: rgba(226,232,240,0.08); }

.weld-seam {
  fill: none;
  stroke: rgba(203,213,225,0.18);
  stroke-width: 3;
  stroke-dasharray: 3 6;
  stroke-linecap: round;
}
.dark-mode .weld-seam { stroke: rgba(226,232,240,0.12); }

.tank-outline {
  fill: none;
  stroke: rgba(148,163,184,0.55);
  stroke-width: 3.2;
}
.dark-mode .tank-outline { stroke: rgba(148,163,184,0.38); }

/* Scale ticks */
.scale line {
  stroke: rgba(148,163,184,0.82);
  stroke-width: 3;
  stroke-linecap: round;
  opacity: 0.65;
}
.dark-mode .scale line { stroke: rgba(148,163,184,0.45); }

/* ===== Water fill + surface slosh ===== */
.water-group {
  transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: 160px 130px;
}

/* ✅ STILL도 아주 약하게 출렁 */
.tank-svg.is-still .surface-pack {
  animation: slosh-tilt-still 5.2s ease-in-out infinite;
  transform-origin: 160px 92px;
  opacity: 0.55;
}
.tank-svg.is-still .water-surface.wave-1 {
  animation: wave-drift-still 4.8s linear infinite;
  opacity: 0.14;
}
.tank-svg.is-still .water-surface.wave-2 {
  animation: wave-drift-still2 3.6s linear infinite;
  opacity: 0.10;
}
.tank-svg.is-still .water-shine {
  animation: shine-move-still 6.2s ease-in-out infinite;
  opacity: 0.32;
}

/* FLOWING: 크게 출렁 */
.tank-svg.is-flowing .surface-pack {
  animation: slosh-tilt 2.6s ease-in-out infinite;
  transform-origin: 160px 92px;
}
.tank-svg.is-flowing .water-surface.wave-1 {
  animation: wave-drift-1 2.3s linear infinite;
  opacity: 0.26;
}
.tank-svg.is-flowing .water-surface.wave-2 {
  animation: wave-drift-2 1.7s linear infinite;
  opacity: 0.20;
}
.tank-svg.is-flowing .water-shine {
  animation: shine-move 2.8s ease-in-out infinite;
  opacity: 0.58;
}

/* Keyframes */
@keyframes slosh-tilt {
  0%   { transform: translateY(0px) rotate(-2.6deg); }
  50%  { transform: translateY(-2px) rotate(2.6deg); }
  100% { transform: translateY(0px) rotate(-2.6deg); }
}
@keyframes wave-drift-1 { 0% { transform: translateX(-18px); } 100% { transform: translateX(18px); } }
@keyframes wave-drift-2 { 0% { transform: translateX(14px); } 100% { transform: translateX(-14px); } }
@keyframes shine-move {
  0%   { transform: translateX(-10px); opacity: 0.48; }
  50%  { transform: translateX(10px);  opacity: 0.70; }
  100% { transform: translateX(-10px); opacity: 0.48; }
}

/* STILL용(약하게) */
@keyframes slosh-tilt-still {
  0%   { transform: translateY(0px) rotate(-0.9deg); }
  50%  { transform: translateY(-1px) rotate(0.9deg); }
  100% { transform: translateY(0px) rotate(-0.9deg); }
}
@keyframes wave-drift-still { 0% { transform: translateX(-10px); } 100% { transform: translateX(10px); } }
@keyframes wave-drift-still2 { 0% { transform: translateX(8px); } 100% { transform: translateX(-8px); } }
@keyframes shine-move-still {
  0%   { transform: translateX(-6px); opacity: 0.26; }
  50%  { transform: translateX(6px);  opacity: 0.38; }
  100% { transform: translateX(-6px); opacity: 0.26; }
}

/* ===== Bubbles (bottom -> up) ===== */
.bubbles.weak .bubble { opacity: 0.0; }
.bubbles.strong .bubble { opacity: 0.0; }

.bubble {
  fill: rgba(255,255,255,0.58);
  filter: drop-shadow(0 2px 6px rgba(255,255,255,0.10));
  transform-box: fill-box;
  transform-origin: center;
}

/* still(약한) */
.tank-svg.is-still .bubbles.weak .b1 { animation: bubble-rise-weak 3.2s linear infinite; animation-delay: 0.0s; }
.tank-svg.is-still .bubbles.weak .b2 { animation: bubble-rise-weak 3.8s linear infinite; animation-delay: 0.3s; }
.tank-svg.is-still .bubbles.weak .b3 { animation: bubble-rise-weak 3.4s linear infinite; animation-delay: 0.6s; }
.tank-svg.is-still .bubbles.weak .b4 { animation: bubble-rise-weak 4.0s linear infinite; animation-delay: 0.2s; }
.tank-svg.is-still .bubbles.weak .b5 { animation: bubble-rise-weak 3.6s linear infinite; animation-delay: 0.5s; }

/* flowing(강한) */
.tank-svg.is-flowing .bubbles.strong .b1 { animation: bubble-rise 1.9s linear infinite; animation-delay: 0.0s; }
.tank-svg.is-flowing .bubbles.strong .b2 { animation: bubble-rise 2.3s linear infinite; animation-delay: 0.2s; }
.tank-svg.is-flowing .bubbles.strong .b3 { animation: bubble-rise 2.0s linear infinite; animation-delay: 0.45s; }
.tank-svg.is-flowing .bubbles.strong .b4 { animation: bubble-rise 2.7s linear infinite; animation-delay: 0.1s; }
.tank-svg.is-flowing .bubbles.strong .b5 { animation: bubble-rise 2.5s linear infinite; animation-delay: 0.35s; }
.tank-svg.is-flowing .bubbles.strong .b6 { animation: bubble-rise 2.1s linear infinite; animation-delay: 0.15s; }
.tank-svg.is-flowing .bubbles.strong .b7 { animation: bubble-rise 2.8s linear infinite; animation-delay: 0.55s; }
.tank-svg.is-flowing .bubbles.strong .b8 { animation: bubble-rise 2.4s linear infinite; animation-delay: 0.25s; }
.tank-svg.is-flowing .bubbles.strong .b9 { animation: bubble-rise 3.0s linear infinite; animation-delay: 0.40s; }
.tank-svg.is-flowing .bubbles.strong .b10{ animation: bubble-rise 2.6s linear infinite; animation-delay: 0.65s; }

@keyframes bubble-rise {
  0%   { transform: translate(0px, 18px) scale(0.92); opacity: 0.0; }
  10%  { opacity: 0.40; }
  50%  { transform: translate(8px, -60px) scale(1.06); opacity: 0.58; }
  90%  { opacity: 0.28; }
  100% { transform: translate(-6px, -128px) scale(0.88); opacity: 0.0; }
}
@keyframes bubble-rise-weak {
  0%   { transform: translate(0px, 12px) scale(0.92); opacity: 0.0; }
  15%  { opacity: 0.22; }
  55%  { transform: translate(5px, -46px) scale(1.03); opacity: 0.30; }
  90%  { opacity: 0.14; }
  100% { transform: translate(-4px, -96px) scale(0.90); opacity: 0.0; }
}

/* HUD percent */
.percent {
  font-size: 32px;
  font-weight: 950;
  fill: #ffffff;
  paint-order: stroke;
  stroke: rgba(2,6,23,0.78);
  stroke-width: 4px;
  letter-spacing: 0.02em;
}

/* gauge info */
.gauge-info.industrial { margin-top: 10px; font-size: 12px; font-weight: 900; opacity: 0.85; }
.flowing-indicator { color: #22c55e; }
.stopped-indicator { color: #94a3b8; }

/* ===================== FLOW METERS v4 (원본 유지) ===================== */
.flow-meters-section.v4 { padding: 6px 0; }

.flow-table-title.v4 {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-weight: 950;
  font-size: 13px;
  opacity: 0.85;
  margin: 4px 0 12px;
}
.flow-table-title.v4 .title-sub {
  font-size: 10px;
  font-weight: 900;
  opacity: 0.45;
  letter-spacing: 0.14em;
  margin-left: 6px;
}
.flow-table-title.v4 .title-icon { filter: drop-shadow(0 6px 14px rgba(0,0,0,0.15)); }

.flow-meters-grid.v4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.fm-card {
  --spin: 0ms;
  --pipe: 0ms;
  --flow: 0%;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(2,6,23,0.08);
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
}

.light-mode .fm-card { background: linear-gradient(180deg, rgba(2,6,23,0.03), rgba(2,6,23,0.01)); }
.dark-mode .fm-card {
  border-color: rgba(255,255,255,0.08);
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015));
}

/* subtle scan line */
.fm-card::before {
  content: "";
  position: absolute;
  inset: -40% -10%;
  background: linear-gradient(90deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.06) 45%,
    rgba(255,255,255,0) 60%
  );
  transform: rotate(12deg);
  opacity: 0.55;
  pointer-events: none;
  animation: fm-scan 5.5s linear infinite;
}
@keyframes fm-scan {
  0% { transform: translateX(-18%) rotate(12deg); }
  100% { transform: translateX(18%) rotate(12deg); }
}

.fm-left { display: flex; flex-direction: column; gap: 12px; }
.fm-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  padding-left: 6px;
  border-left: 1px dashed rgba(148,163,184,0.25);
}
.dark-mode .fm-right { border-left-color: rgba(148,163,184,0.18); }

.fm-badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.fm-unit {
  font-size: 10px;
  font-weight: 950;
  opacity: 0.55;
  letter-spacing: 0.12em;
}
.fm-rx {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 950;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(2,6,23,0.10);
  background: rgba(148,163,184,0.10);
}
.dark-mode .fm-rx { border-color: rgba(255,255,255,0.10); }
.fm-rx .dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(148,163,184,0.8);
  box-shadow: 0 0 0 3px rgba(148,163,184,0.18);
}
.fm-rx.ok { color: #3b82f6; background: rgba(59,130,246,0.10); }
.fm-rx.ok .dot { background: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
.fm-rx.fail { color: #ef4444; background: rgba(239,68,68,0.10); }
.fm-rx.fail .dot { background: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.18); }

/* Pipe + meter cluster */
.fm-pipe-wrap {
  display: grid;
  grid-template-columns: 1fr 72px;
  gap: 14px;
  align-items: center;
}

.fm-pipe {
  position: relative;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(2,6,23,0.10);
  background: rgba(148,163,184,0.18);
}
.dark-mode .fm-pipe { border-color: rgba(255,255,255,0.10); background: rgba(148,163,184,0.14); }

.fm-pipe-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.12));
  opacity: 0.65;
}

.fm-pipe-flow {
  position: absolute;
  inset: 0;
  opacity: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(99,230,255,0.0) 0px,
    rgba(99,230,255,0.0) 10px,
    rgba(42,160,255,0.70) 10px,
    rgba(42,160,255,0.70) 18px
  );
  transform: translateX(-35%);
}
.fm-card.is-flowing .fm-pipe-flow {
  opacity: 1;
  animation: fm-pipe-move var(--pipe, 900ms) linear infinite;
}
.fm-card.is-stopped .fm-pipe-flow { opacity: 0.22; animation: none; }
@keyframes fm-pipe-move { from { transform: translateX(-35%); } to { transform: translateX(35%); } }

/* Tiny bubbles in pipe when flowing */
.fm-pipe-bubbles { position: absolute; inset: 0; pointer-events: none; }
.fm-pipe-bubbles .b {
  position: absolute;
  top: 50%;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.55);
  transform: translate(-20%, -50%);
  opacity: 0;
}
.fm-pipe-bubbles .b1 { left: 22%; animation: fm-bubble var(--pipe, 900ms) linear infinite; }
.fm-pipe-bubbles .b2 { left: 48%; animation: fm-bubble calc(var(--pipe, 900ms) * 1.15) linear infinite; }
.fm-pipe-bubbles .b3 { left: 74%; animation: fm-bubble calc(var(--pipe, 900ms) * 0.9) linear infinite; }
@keyframes fm-bubble {
  0% { transform: translate(-40%, -50%) scale(0.85); opacity: 0; }
  20% { opacity: 0.45; }
  60% { transform: translate(40%, -60%) scale(1.05); opacity: 0.55; }
  100% { transform: translate(90%, -40%) scale(0.8); opacity: 0; }
}

/* Meter body */
.fm-meter {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(2,6,23,0.10);
  background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(0,0,0,0.10));
}
.dark-mode .fm-meter { border-color: rgba(255,255,255,0.10); }

.fm-impeller { width: 62px; height: 62px; color: #3b82f6; }
.fm-impeller .rim { fill: none; stroke: currentColor; stroke-width: 1.2; opacity: 0.22; }
.fm-impeller .glass { opacity: 0.78; }
.fm-impeller .blades { fill: currentColor; transform-origin: 32px 32px; }
.fm-impeller .hub { fill: #334155; opacity: 0.92; }

.fm-card.is-flowing .fm-impeller .blades { animation: fm-rotate var(--spin, 900ms) linear infinite; }
.fm-card.is-stopped .fm-impeller .blades { animation: none; opacity: 0.45; }
@keyframes fm-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.fm-state {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
}
.pill {
  font-size: 9px;
  font-weight: 950;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(2,6,23,0.10);
  background: rgba(148,163,184,0.16);
}
.dark-mode .pill { border-color: rgba(255,255,255,0.10); }
.pill.on { background: rgba(34,197,94,0.16); color: #16a34a; }
.pill.off { background: rgba(148,163,184,0.18); color: #64748b; }

/* Flow bar */
.fm-bar { display: grid; gap: 6px; }
.fm-bar-label { font-size: 11px; font-weight: 900; opacity: 0.6; }
.fm-bar-track {
  height: 10px;
  border-radius: 999px;
  position: relative;
  background: rgba(148,163,184,0.18);
  overflow: hidden;
  border: 1px solid rgba(2,6,23,0.08);
}
.dark-mode .fm-bar-track { border-color: rgba(255,255,255,0.08); }
.fm-bar-fill {
  position: absolute;
  inset: 0;
  width: var(--flow);
  background: linear-gradient(90deg, rgba(99,230,255,0.65), rgba(42,160,255,0.9));
  border-radius: 999px;
  box-shadow: 0 10px 26px rgba(42,160,255,0.18);
  transition: width 420ms ease;
}
.fm-card.is-flowing .fm-bar-fill { animation: fm-bar-pulse 1.8s ease-in-out infinite; }
@keyframes fm-bar-pulse {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.18); }
  100% { filter: brightness(1); }
}

/* Right texts */
.fm-title {
  font-size: 12px;
  font-weight: 950;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 10px;
}
.fm-title .led {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: rgba(148,163,184,0.65);
  box-shadow: 0 0 0 4px rgba(148,163,184,0.14);
}
.fm-title .led.on { background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,0.16); }
.fm-title .led.off { background: #94a3b8; box-shadow: 0 0 0 4px rgba(148,163,184,0.14); }

.fm-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 12px;
}
.fm-row .k { opacity: 0.6; font-weight: 900; }
.fm-row.big .v { font-size: 18px; font-weight: 950; color: #3b82f6; }
.fm-row.big .u { font-size: 11px; opacity: 0.75; margin-left: 4px; font-weight: 900; }
.fm-row .v2 { font-weight: 950; }
.fm-row .v2.normal { color: #22c55e; }
.fm-row .v2:not(.normal) { color: #ef4444; }
.fm-row .v3 { font-size: 11px; font-weight: 900; opacity: 0.65; }

.fm-mini-hint {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.55;
  display: flex;
  align-items: center;
  gap: 8px;
}
.fm-mini-hint .hint-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: rgba(59,130,246,0.75);
}

/* Graphs */
.graph-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.graph-card { background: rgba(0,0,0,0.02); padding: 16px; border-radius: 16px; height: 320px; display: flex; flex-direction: column; }
.dark-mode .graph-card { background: rgba(255,255,255,0.03); }
.graph-title { font-size: 13px; font-weight: 800; opacity: 0.6; margin-bottom: 12px; }

@media (max-width: 1024px) {
  .gauge-and-flow-container, .graph-section { grid-template-columns: 1fr; }
  .flow-meters-grid.v4 { grid-template-columns: 1fr; }
  .fm-card { grid-template-columns: 1fr; }
  .fm-right {
    border-left: none;
    padding-left: 0;
    border-top: 1px dashed rgba(148,163,184,0.22);
    padding-top: 10px;
  }
}
</style>
