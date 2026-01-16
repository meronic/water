<template>
  <div
    class="graph-card"
    :class="[
      { 'fill-height': fillHeight },
      isDark ? 'dark-mode' : 'light-mode',
    ]"
  >
    <h3 class="graph-title">
      {{ graphTitle }}
    </h3>

    <div class="canvas-wrap">
      <canvas v-if="!loading && transformedData?.values?.length" ref="chartRef" style="width: 100%; height: 100%" />
      <div v-else-if="loading" class="loading-state">
        <v-icon icon="mdi-loading" size="32" class="spinner" />
        <p>데이터 로드 중...</p>
      </div>
      <div v-else class="empty-state">
        <v-icon icon="mdi-chart-box-outline" size="32" />
        <p>데이터가 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTheme } from 'vuetify'
import { Chart, registerables } from 'chart.js'
import { useShipStore } from '@/stores/shipStore'
import { getFlowData } from '@/api/flow'

const props = defineProps({
  tankId: { type: String, required: true },
  type: { type: String, required: true }, // 'accumulated' | 'hourly'
  fillHeight: { type: Boolean, default: false },
  interval: { type: String, default: '1h' },
  from: { type: String, default: 'detail' },
  refresh: Number,
  measurement: { type: String, default: '' },
})

Chart.register(...registerables)

const isDetail = computed(() => props.from === 'detail')

const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)
const graphTitle = computed(() => (props.type === 'accumulated' ? '누적 주수량' : '시간당 주수량'))

const loading = ref(false)
const chartRef = ref(null)
let chartInstance = null
const transformedData = ref(null)
let ro = null

let dailyRefreshTimeout = null
let dailyRefreshInterval = null

const shipStore = useShipStore()

const tankInfo = computed(() => {
  const ship = shipStore.shipList.find(s => s.name === shipStore.selectedShip)
  return ship?.tank.find(t => t.name === props.tankId) || null
})

const shipNo = computed(() => shipStore.selectedShip ?? '')

const isUTC = false

const formatTimeKST = (input, isDashboard = false) => {
  const date = new Date(input)
  if (isDashboard) {
    return date.toLocaleString('ko-KR', {
      hour12: false, timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit',
    }).replace(',', '')
  }
  return date.toLocaleString('ko-KR', {
    hour12: false, timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).replace(',', '')
}

const formatTimeUTC = (input, isDashboard = false) => {
  const date = new Date(input)
  if (isDashboard) return date.toISOString().slice(11, 16)
  return date.toISOString().slice(5, 16).replace('T', ' ')
}

const computeMaxPoints = () => {
  if (props.from === 'dashboard') return Number.MAX_SAFE_INTEGER
  const isMobile = window.innerWidth <= 750
  if (isDetail.value && isMobile) return 30
  return isMobile ? 40 : 100
}

const downsampleTriple = (labels, values, goals, maxPoints = 200) => {
  const total = labels.length
  if (total <= maxPoints) return { labels, values, goals }
  const step = Math.floor(total / maxPoints)
  const newLabels = []
  const newValues = []
  const newGoals = []
  for (let i = 0; i < total; i += step) {
    newLabels.push(labels[i])
    newValues.push(values[i])
    newGoals.push(goals[i])
  }
  return { labels: newLabels, values: newValues, goals: newGoals }
}

const queryCache = new Map()
const cacheTTLms = 30_000
const ttlTimers = new Map()
function makeCacheKey(url, params) {
  const sorted = Object.fromEntries(Object.entries(params || {}).sort(([a], [b]) => a.localeCompare(b)))
  return `${url}?${JSON.stringify(sorted)}`
}
function setCache(key, promise) {
  queryCache.set(key, promise)
  if (ttlTimers.has(key)) clearTimeout(ttlTimers.get(key))

  const t = setTimeout(() => {
    queryCache.delete(key)
    ttlTimers.delete(key)
  }, cacheTTLms)

  ttlTimers.set(key, t)
}

let currentController = null

const kstDayRangeISO = () => {
  const tz = 'Asia/Seoul'

  const getKstYmd = () => {
    const now = new Date()
    return now.toLocaleString('sv-SE', { timeZone: tz }).slice(0, 10)
  }

  const ymd = getKstYmd()

  const startKst = new Date(`${ymd}T00:00:00+09:00`)
  const endKst = new Date(`${ymd}T23:59:59.999+09:00`)

  return {
    startISO: startKst.toISOString(),
    endISO: endKst.toISOString(),
  }
}

const processData = (rawData) => {
  const rows = (rawData || []).filter(
    r => r.time && !isNaN(new Date(r.time)) && !isNaN(Number(r.value))
  )

  const bucketKey = (isoString) => {
    if (props.from !== 'dashboard') return isoString
    const d = new Date(isoString)
    const h = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours())
    return h.toISOString()
  }

  const formatTime = (time) => (
    isUTC ? formatTimeUTC(time, props.from === 'dashboard')
      : formatTimeKST(time, props.from === 'dashboard')
  )

  const MAX_POINTS = computeMaxPoints()

  const srcOf = (r) => {
    const u = r.device_uuid ?? r.uuid ?? r.device ?? ''
    const m = r.measurement ?? r.meas ?? r.src ?? ''
    const s = r.source ?? r.series ?? r.src_index ?? ''
    const t = r.tank_name ?? r.tank ?? ''
    const k = [u, m, s, t].filter(Boolean).join('|')
    return k || 'src'
  }

  if (props.type === 'accumulated') {
    const lastBySrcBucket = new Map()
    for (const r of rows) {
      const src = srcOf(r)
      const bk = bucketKey(r.time)
      const tMs = new Date(r.time).getTime()
      if (!lastBySrcBucket.has(src)) lastBySrcBucket.set(src, new Map())
      const m = lastBySrcBucket.get(src)
      const prev = m.get(bk)
      if (!prev || tMs > prev.t) {
        m.set(bk, {
          t: tMs,
          v: Number(Number(r.value)?.toFixed(3)),
          g: (r.goal ?? r.accumulationSetting ?? r.accumulation_setting),
        })
      }
    }

    const allBuckets = new Set()
    for (const m of lastBySrcBucket.values()) for (const k of m.keys()) allBuckets.add(k)
    const sortedBuckets = Array.from(allBuckets).sort()

    const labels = []
    const values = []
    const goals = []

    for (const bk of sortedBuckets) {
      let sumV = 0
      let sumG = 0
      for (const m of lastBySrcBucket.values()) {
        const rec = m.get(bk)
        if (!rec) continue
        sumV += rec.v

        const gRaw = rec.g
        if (gRaw != null && !Number.isNaN(Number(gRaw))) sumG += Number(Number(gRaw).toFixed(3))
      }
      labels.push(formatTime(bk))
      values.push(Number(sumV?.toFixed(3)))
      goals.push(Number(sumG?.toFixed(3)))
    }

    return downsampleTriple(labels, values, goals, MAX_POINTS)
  }

  if (props.type === 'hourly') {
    const lastBySrcBucket = new Map()
    for (const r of rows) {
      const src = srcOf(r)
      const bk = bucketKey(r.time)
      const tMs = new Date(r.time).getTime()
      if (!lastBySrcBucket.has(src)) lastBySrcBucket.set(src, new Map())
      const m = lastBySrcBucket.get(src)
      const prev = m.get(bk)
      if (!prev || tMs > prev.t) {
        m.set(bk, { t: tMs, v: Number(Number(r.value)?.toFixed(3)) })
      }
    }

    const bucketSet = new Set()
    for (const m of lastBySrcBucket.values()) for (const k of m.keys()) bucketSet.add(k)
    const sortedBuckets = Array.from(bucketSet).sort()

    const bucketSums = []
    for (const bk of sortedBuckets) {
      let sumV = 0
      for (const m of lastBySrcBucket.values()) {
        const rec = m.get(bk)
        if (rec) sumV += rec.v
      }
      bucketSums.push([bk, Number(sumV?.toFixed(3))])
    }

    const labels = []
    const values = []
    let prevSum = null
    for (const [bk, sumV] of bucketSums) {
      const diff = (prevSum == null) ? 0 : (sumV - prevSum)

      labels.push(formatTime(bk))
      values.push(Number((diff < 0 ? 0 : diff)?.toFixed(3)))
      prevSum = sumV
    }

    return downsampleTriple(labels, values, [], MAX_POINTS)
  }

  return { labels: [], values: [], goals: [] }
}

const fetchDataAndRender = async () => {
  if (!tankInfo.value || !shipNo.value) {
    console.warn('그래프 데이터를 불러올 수 없습니다: tankInfo 또는 shipNo 없음', { tankInfo: tankInfo.value, shipNo: shipNo.value })
    return
  }

  try {
    if (isDetail.value) {
      loading.value = true
      await nextTick()
      await new Promise(requestAnimationFrame)
    }

    const rawSources = Array.isArray(tankInfo.value?.sources) ? tankInfo.value.sources : []

    const measurements = rawSources
      .map(s => (typeof s === 'string' ? s : (s?.measurement ?? s?.name ?? s?.id ?? '')))
      .filter(Boolean)

    const uuids = rawSources
      .map(s => (typeof s === 'string' ? '' : (s?.device_uuid ?? s?.uuid ?? '')))
      .filter(Boolean)

    const params = {
      unit: props.interval,
      shipNo: shipNo.value,
      tankName: tankInfo.value.name,
      type: props.type,
    }

    if (measurements.length) {
      params.measurements = measurements.join(',')
      if (!props.measurement) params.measurement = measurements[0]
    } else if (props.measurement) {
      params.measurement = props.measurement
    }

    if (uuids.length > 1) {
      params.deviceUuids = uuids.join(',')
    } else if (uuids.length === 1) {
      params.deviceUuid = uuids[0]
    } else if (tankInfo.value?.uuid) {
      params.deviceUuid = tankInfo.value.uuid
    } else if (shipStore.selectedDeviceUuid) {
      params.deviceUuid = shipStore.selectedDeviceUuid
    }

    if (!isDetail.value) {
      const { startISO, endISO } = kstDayRangeISO()
      params.start = startISO
      params.end = endISO
    }

    const url = '/flow/data'
    const key = makeCacheKey(url, params)

    if (currentController) currentController.abort()
    currentController = new AbortController()

    let p = queryCache.get(key)
    if (!p) {
      p = await getFlowData(params, { signal: currentController.signal })
      setCache(key, p)
    }

    const res = await p
    console.log(`[GraphPanel] 데이터 수신 (${props.type}):`, { tankId: props.tankId, dataCount: res?.length, type: props.type })
    const transformed = processData(res)
    console.log(`[GraphPanel] 데이터 변환 (${props.type}):`, { tankId: props.tankId, labels: transformed.labels.length, values: transformed.values.length })

    transformedData.value = transformed
    renderChart(transformed)
  } catch (err) {
    if (err?.name === 'CanceledError' || err?.name === 'AbortError') return
    console.error('그래프 API 실패:', err)
  } finally {
    if (isDetail.value) loading.value = false
  }
}

const renderChart = ({ labels, values, goals }) => {
  if (!chartRef.value || !values.length) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }
    return
  }
  const ctx = chartRef.value.getContext('2d')
  if (chartInstance) chartInstance.destroy()

  const tickColor = isDark.value ? 'white' : 'black'
  const gridColor = isDark.value ? '#666' : '#ccc'
  const isAccumulated = props.type === 'accumulated'

  const isMobile = window.innerWidth <= 750
  const desiredMax = isMobile ? 4 : 20
  const isDetailView = props.from === 'detail'

  const useDetailStyle = isDetailView && !isMobile
  const xTickColor = useDetailStyle ? '#404040' : tickColor
  const xFontSize = useDetailStyle
    ? 20
    : (isMobile ? Math.max(8, Math.floor(window.innerWidth / 40)) : 14)

  const xFontWeight = useDetailStyle ? 'bold' : 'normal'
  const step = Math.max(1, Math.ceil(labels.length / desiredMax))

  const datasets = isAccumulated
    ? [
      {
        label: '실제 주수량',
        data: values,
        backgroundColor: 'rgba(96, 165, 250, 0.3)',
        borderColor: 'rgba(96, 165, 250, 1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: '목표 주수량',
        data: goals,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderColor: 'rgba(139, 92, 246, 1)',
        fill: true,
        pointRadius: 0,
        tension: 0,
        stepped: 'before',
      },
    ]
    : [
      {
        label: '시간당 주수량',
        data: values,
        backgroundColor: 'rgba(96, 165, 250, 0.6)',
        borderRadius: 4,
      },
    ]

  chartInstance = new Chart(ctx, {
    type: isAccumulated ? 'line' : 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      layout: { padding: { right: 10 } },
      plugins: {
        legend: {
          position: isMobile ? 'top' : 'right',
          align: 'center',
          labels: { color: tickColor, boxHeight: 12 },
        },
        tooltip: {
          callbacks: {
            label: (c) => `${c.dataset.label}: ${c.parsed.y} m³`,
          },
        },
        datalabels: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: xTickColor,
            maxTicksLimit: desiredMax,
            maxRotation: 0,
            minRotation: 0,
            font: {
              size: xFontSize,
              weight: xFontWeight,
            },
            callback: function (value, index) {
              if (index % step !== 0) return ''

              const rawLabel = this.getLabelForValue(value)

              if (!isDetailView) return rawLabel

              const match = rawLabel.match(/(\d+)\.\s*(\d+)\.\s*(\d+):(\d+)/)
              if (!match) return rawLabel

              const [, m, d, hh, mm] = match
              const datePart = `${m}/${d}`
              const timePart = `${hh}:${mm}`

              let showDate = false
              if (index === 0) {
                showDate = true
              } else {
                const prevIndex = index - step
                if (prevIndex >= 0 && labels[prevIndex]) {
                  const prevLabel = labels[prevIndex]
                  const prevMatch = prevLabel.match(/(\d+)\.\s*(\d+)\./)
                  if (prevMatch) {
                    const prevDatePart = `${prevMatch[1]}/${prevMatch[2]}`
                    if (prevDatePart !== datePart) showDate = true
                  } else {
                    showDate = true
                  }
                } else {
                  showDate = true
                }
              }

              return showDate ? [datePart, timePart] : timePart
            },
          },
          grid: { color: gridColor },
        },
        y: {
          ticks: {
            color: tickColor,
            font: {
              size: isMobile ? Math.max(8, Math.floor(window.innerWidth / 40)) : 14,
            },
            callback: (v) => `${v} m³`,
          },
          grid: { color: gridColor },
          beginAtZero: true,
        },
      },
    },
  })
}

let rafId = 0

const rerenderThrottled = () => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rafId = 0
    if (transformedData.value) renderChart(transformedData.value)
  })
}

const handleResize = () => { rerenderThrottled() }

const msUntilNextKST0000 = () => {
  const nowUtcMs = Date.now()
  const kstNow = new Date(nowUtcMs + 9 * 60 * 60 * 1000)
  const y = kstNow.getUTCFullYear()
  const m = kstNow.getUTCMonth()
  const d = kstNow.getUTCDate()

  const nextMidnightUtcMs = Date.UTC(y, m, d + 1, -9, 0, 0, 0)
  return Math.max(0, nextMidnightUtcMs - nowUtcMs)
}

const scheduleDailyRefreshAtKST0000 = () => {
  const delay = msUntilNextKST0000()

  dailyRefreshTimeout = setTimeout(() => {
    fetchDataAndRender()
    dailyRefreshInterval = setInterval(() => {
      fetchDataAndRender()
    }, 24 * 60 * 60 * 1000)
  }, delay)
}

const clearDailyRefreshTimers = () => {
  if (dailyRefreshTimeout) {
    clearTimeout(dailyRefreshTimeout)
    dailyRefreshTimeout = null
  }
  if (dailyRefreshInterval) {
    clearInterval(dailyRefreshInterval)
    dailyRefreshInterval = null
  }
}

onMounted(() => {
  fetchDataAndRender()
  ro = new ResizeObserver(() => { rerenderThrottled() })

  const host = chartRef.value?.closest('.graph-card')
  if (host) ro.observe(host)
  window.addEventListener('resize', handleResize)
  scheduleDailyRefreshAtKST0000()
})

onUnmounted(() => {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  if (ro) { ro.disconnect(); ro = null }
  window.removeEventListener('resize', handleResize)
  if (currentController) currentController.abort()
  clearDailyRefreshTimers()
})

watch(
  () => [props.tankId, props.type, tankInfo.value],
  () => {
    if (tankInfo.value) {
      fetchDataAndRender()
    }
  },
  { deep: true }
)

watch(isDark, () => rerenderThrottled())
if (props.refresh !== undefined) {
  watch(() => props.refresh, () => { fetchDataAndRender() })
}

watch(
  () => [props.measurement, tankInfo.value?.uuid, shipStore.selectedDeviceUuid],
  () => {
    transformedData.value = null
    if (chartInstance) { chartInstance.destroy(); chartInstance = null }
    fetchDataAndRender()
  }
)
</script>

<style scoped>
.graph-card {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-radius: 12px;
  height: 100%;
  min-height: 200px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.graph-card.fill-height {
  height: 100% !important;
}

.graph-card.dark-mode {
  color: white;
  background-color: rgba(15, 23, 42, 0.65);
}

.graph-card.light-mode {
  background-color: #ffffff;
  color: #222;
}

.graph-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 6px;
}

.canvas-wrap {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 140px;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 8px;
  color: rgba(0, 0, 0, 0.4);
}

.dark-mode .loading-state,
.dark-mode .empty-state {
  color: rgba(255, 255, 255, 0.4);
}

.loading-state p,
.empty-state p {
  font-size: 12px;
  margin: 0;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 750px) {
  .graph-card {
    min-height: 175px;
  }

  .canvas-wrap {
    min-height: 140px;
  }
}
</style>
