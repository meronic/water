<template>
  <div :class="['camera-wrapper', isDark ? 'dark-mode' : 'light-mode']">
    <template v-if="smallScreen">
      <div class="camera-select">
        <select v-model.number="singleSelection">
          <option
            v-for="(cam, idx) in camImages"
            :key="idx"
            :value="idx"
          >
            {{ displayName(idx) }}
          </option>
        </select>
      </div>
    </template>
    <template v-else>
      <div class="camera-sidebar">
        <div class="camera-header">
          <!-- Cam List 글자 7번 클릭 → IP 수정 모달 -->
          <h3 class="camera-list-title" @click="onCamListClick">Cam List</h3>
          <!-- 전체 초기화 -->
          <button
            class="reset-button"
            @click="resetSelection"
            :style="{ backgroundColor: primaryColor }"
          >
            전체 초기화
          </button>
        </div>

        <!-- 이름 수정 버튼 -->
        <div style="margin-bottom:10px;">
          <button
            @click="openConfig('name')"
            style="border:1px solid #ddd; border-radius:6px; padding:4px 8px; background:transparent; cursor:pointer; font-size:12px;"
          >
            이름 수정
          </button>
        </div>

        <div
          v-for="(cam, index) in camImages"
          :key="index"
          class="camera-item"
          :class="{ active: selected.includes(index) }"
          :style="selected.includes(index) ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}"
          @click="toggleCam(index)"
        >
          <!-- 이름 + IP + Online/Offline -->
          <div>
            <div>{{ displayName(index) }}</div>
            <div v-if="cameraIPs[index]" style="font-size:12px; opacity:.85; margin-top:2px;">
              {{ cameraIPs[index] }} &nbsp;
              <span :style="{ color: streamActive[index] ? '#4caf50' : '#f44336' }">
                {{ streamActive[index] ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>

          <span class="status-icon">
            <span v-if="selected.includes(index)">✔️</span>
            <span v-else>⚪</span>
          </span>
        </div>
      </div>
    </template>

    <div class="camera-page">
      <!-- 소형 화면: 단일 셀 -->
      <div v-if="smallScreen" class="camera-grid grid-1">
        <div class="camera-cell" @click="showModal(singleSelection)">
          <img
            :ref="el => { if (el) imgRefs[singleSelection] = el }"
            :src="mjpegSrc[singleSelection] || camImages[singleSelection]"
            class="camera-feed"
            alt="camera"
            @error="onImgError(singleSelection)"
            @load="onImgLoad(singleSelection)"
          />
          <div class="camera-name" :style="{ backgroundColor: primaryColor }">
            {{ displayName(singleSelection) }}
          </div>
        </div>
      </div>

      <!-- 일반 화면: 선택된 카메라들 -->
      <div v-else class="camera-grid" :class="gridClass">
        <div
          v-for="(camIdx, i) in selected"
          :key="i"
          class="camera-cell"
          @click="showModal(camIdx)"
        >
          <img
            :ref="el => { if (el) imgRefs[camIdx] = el }"
            :src="mjpegSrc[camIdx] || camImages[camIdx]"
            class="camera-feed"
            alt="camera"
            @error="onImgError(camIdx)"
            @load="onImgLoad(camIdx)"
          />
          <div class="camera-name" :style="{ backgroundColor: primaryColor }">
            {{ displayName(camIdx) }}
          </div>
        </div>
        <div
          v-for="i in emptyCellCount"
          :key="i"
          class="camera-cell empty"
        />
      </div>

      <CameraModal
        :visible="cameraModal.visible"
        :camImage="cameraModal.camIndex != null ? camImages[cameraModal.camIndex] : ''"
        :title="currentCamTitle"
        @close="cameraModal.close"
      />

      <!-- 설정 모달: mode = 'name' | 'ip' -->
      <CameraConfigModal
        :visible="configModal.visible"
        :mode="configModal.mode"
        :items="configItems"
        @save="onConfigSave"
        @close="closeConfig"
      />
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  onDeactivated,
} from 'vue'
import { useTheme } from 'vuetify'
import { useCameraModalStore } from '@/stores/cameraModal'
import axiosIns from '@/plugins/axios'
import { getMjpegUrl, stopCamera, getCameraConfig, saveCameraConfig, getStreamActive } from '@/api/camera'

import cam1 from '../assets/images/avatars/avatar-1.png'
import cam2 from '../assets/images/avatars/avatar-2.png'
import cam3 from '../assets/images/avatars/avatar-3.png'
import cam4 from '../assets/images/avatars/avatar-4.png'
import cam5 from '../assets/images/avatars/avatar-5.png'
import cam6 from '../assets/images/avatars/avatar-6.png'
import cam7 from '../assets/images/avatars/avatar-7.png'
import cam8 from '../assets/images/avatars/avatar-8.png'

import CameraModal from '../components/CameraModal.vue'
import CameraConfigModal from '../components/CameraConfigModal.vue'

/* =========================
   기본 데이터/상태
   ========================= */
const camImages = [cam1, cam2, cam3, cam4, cam5, cam6, cam7, cam8]
const selected = ref([0, 1])
const smallScreen = ref(window.innerWidth <= 600)

const cameraModal = useCameraModalStore()

// 이름/아이피
const cameraNames = reactive({}) // { [idx]: string }
const cameraIPs = reactive({})   // { [idx]: string }

// MJPEG src, <img> ref
const mjpegSrc = reactive({})   // { [idx]: string }
const imgRefs  = reactive({})   // { [idx]: HTMLImageElement }

// 온라인 감지 상태 (백엔드 핑 + 에러 이벤트 보조)
const streamActive = reactive({}) // { [idx]: boolean }

/* =========================
   Vuetify theme
   ========================= */
const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)
const primaryColor = computed(() => theme.current.value.colors.primary)

/* =========================
   반응형
   ========================= */
onMounted(() => {
  const onResize = () => {
    smallScreen.value = window.innerWidth <= 600
  }

  window.addEventListener('resize', onResize)
  onUnmounted(() => window.removeEventListener('resize', onResize))
})

/* =========================
   선택 제어
   ========================= */
const singleSelection = computed({
  get: () => selected.value[0] ?? 0,
  set: async val => {
    // 기존 선택 스트림 모두 끊고 단일로 전환
    await Promise.all(selected.value.map(idx => stopStream(idx)))
    selected.value = [val]
    await openStream(val)
  }
})

const toggleCam = async (index) => {
  if (selected.value.includes(index)) {
    selected.value.splice(selected.value.indexOf(index), 1)
    await stopStream(index)
  } else {
    selected.value.push(index)
    await openStream(index)
  }
}

const resetSelection = async () => {
  await Promise.all(selected.value.map(idx => stopStream(idx)))
  selected.value = []
}

const showModal = index => cameraModal.open(index)

const gridClass = computed(() => {
  const c = selected.value.length
  if (c <= 1) return 'grid-1'
  if (c === 2) return 'grid-2'
  if (c <= 4) return 'grid-2x2'
  return 'grid-3x3'
})

const emptyCellCount = computed(() => {
  const c = selected.value.length
  return {
    'grid-1': 1 - c,
    'grid-2': 2 - c,
    'grid-2x2': 4 - c,
    'grid-3x3': 9 - c,
  }[gridClass.value] || 0
})

/* =========================
   MJPEG 스트림
   ========================= */
// 백엔드에서 Node로 연결되는 mjpeg64 URL 발급 → <img src> 세팅
const openStream = async (camIdx) => {
  try {
    const data = await getMjpegUrl(camIdx)

    if (data?.ok && data?.url) {
      // ✅ MJPEG URL 정상 응답 → 스트림 시작
      mjpegSrc[camIdx] = `${data.url}&v=${Date.now()}` // 재연결용 캐시 버스트
      streamActive[camIdx] = true
    } else {
      // ❌ 백엔드 응답은 왔는데 ok가 아니거나 url 없음 → 기본 이미지
      mjpegSrc[camIdx] = camImages[camIdx] || ''
      streamActive[camIdx] = false
    }
  } catch (err) {
    console.error('openStream error', err)

    // ❌ 예외 발생(백엔드 죽었거나 네트워크 문제 등) → 기본 이미지
    mjpegSrc[camIdx] = camImages[camIdx] || ''
    streamActive[camIdx] = false
  }
}


const stopStream = async (camIdx) => {
  console.log('[stopStream] called with camIdx =', camIdx)
  console.log('[stopCamera] baseURL =', axiosIns.defaults.baseURL)

  try {
    mjpegSrc[camIdx] = ''
    streamActive[camIdx] = false

    const res = await stopCamera(camIdx)

    console.log('[stopStream] stopCamera response =', res)
    
  } catch (err) {
    console.error('stopStream error:', err)
  }
}


// <img> 이벤트(참고용): multipart라 frame마다 load가 오지 않을 수 있음.
// 에러 시 Offline 처리하고, 재시도 하고 싶으면 여기서 openStream 재호출해도 됨.
const onImgError = (idx) => {
  mjpegSrc[idx] = camImages[idx] || ''
  streamActive[idx] = false
}

const onImgLoad = (idx) => {
  // 최초 연결 성공 정도 지표로만 사용
  // mjpegSrc[idx] = camImages[idx] || ''
  streamActive[idx] = true
}

/* 선택 변경 시 스트림 열고 닫기 */
watch(
  () => [...selected.value],
  async (newVal, oldVal = []) => {
    const removed = oldVal.filter(x => !newVal.includes(x))
    const added = newVal.filter(x => !oldVal.includes(x))

    await Promise.all(removed.map(idx => stopStream(idx)))
    for (const idx of added) await openStream(idx)
  },
  { immediate: false, flush: 'post' }
)

/* =========================
   설정 로드/저장
   ========================= */
const defaultName = (idx) => `Camera ${idx + 1}`
const displayName = (idx) => cameraNames[idx] || defaultName(idx)

const toIndex = row => {
  const v =
    row.camIdx ??
    row.cam_idx ??
    row.index ??
    row.idx ??
    row.id

  const n = Number(v)
  return Number.isFinite(n) ? n : -1
}

const currentCamTitle = computed(() => {
  const i = Number(cameraModal.camIndex)
  if (!Number.isInteger(i) || i < 0 || i >= camImages.length) return ''
  const n = String(cameraNames[i] ?? '').trim()
  return n || `Camera ${i + 1}`
})

const loadConfig = async () => {
  try {
    const data = await getCameraConfig()

    if (Array.isArray(data)) {
      data.forEach(row => {
        const i = toIndex(row)
        if (i >= 0) {
          if (row.name != null) cameraNames[i] = row.name
          if (row.ip   != null) cameraIPs[i]   = row.ip
        }
      })
    } else if (data && typeof data === 'object') {
      Object.keys(data).forEach(k => {
        const v = data[k]
        const i = toIndex(v)
        if (i >= 0) {
          if (v?.name != null) cameraNames[i] = v.name
          if (v?.ip   != null) cameraIPs[i]   = v.ip
        }
      })
    }
  } catch (e) {
    console.warn('[camera-config] load failed', e)
  }
}

const saveConfig = async (payload) => {
  try {
    /*
    const ok = await saveCameraConfig(payload)
    if (ok) {
      alert('저장 완료')

      // 🔥 강력 새로고침 (전체 페이지 리로드)
      window.location.reload() // (Ctrl+F5 급으로 다시 불러옴)
    } else {
      alert('저장 실패')
    }
    */
    await saveCameraConfig(payload)
    alert('저장 완료')
  } catch (e) {
    console.error('[camera-config] save failed', e)
    alert('저장 실패 (서버 오류)')
  }
}

/* 이름/IP 편집 모달 */
const configModal = reactive({
  visible: false,
  mode: 'name', // 'name' | 'ip'
})

let camListClicks = 0
const onCamListClick = () => {
  camListClicks++
  if (camListClicks % 7 === 0) openConfig('ip')
}

const openConfig = (mode) => {
  configModal.mode = mode
  configModal.visible = true
}
const closeConfig = () => { configModal.visible = false }

const configItems = computed(() => {
  return camImages.map((_, i) => ({
    camIdx: i,
    label: `#${i + 1}`,
    value: configModal.mode === 'name'
      ? (cameraNames[i] ?? defaultName(i))
      : (cameraIPs[i] ?? ''),
    readonlyLabel: displayName(i),
  }))
})

const onConfigSave = async (updatedList) => {
  try {
    if (configModal.mode === 'name') {
      updatedList.forEach(({ camIdx, value }) => {
        cameraNames[camIdx] = (value || '').trim() || defaultName(camIdx)
      })
    } else {
      updatedList.forEach(({ camIdx, value }) => {
        cameraIPs[camIdx] = (value || '').trim()
      })
    }
    const payload = updatedList.map(({ camIdx, value }) =>
      configModal.mode === 'name'
        ? ({ camIdx, name: value })
        : ({ camIdx, ip: value })
    )
    await saveConfig(payload)
  } catch (e) {
    console.error('config save failed', e)
    alert('저장에 실패했습니다.')
  } finally {
    closeConfig()
  }
}

/* =========================
   온라인/오프라인: 백엔드 폴링
   ========================= */
   const pollStreamActive = async (idx) => {
  try {
    const data = await getStreamActive(idx)
    if (typeof data?.active === 'boolean') {
      streamActive[idx] = data.active
    }
  } catch {
    // 백엔드 없으면 무시
  }
}

let streamTimer = null
const startStreamPoll = () => {
  stopStreamPoll()

  const poll = async () => {
    // 🔸 전체 카메라 말고, 선택된 카메라만 체크
    for (const idx of selected.value) 
    
      await pollStreamActive(idx)
    
  }

  poll()
  streamTimer = setInterval(poll, 5000)
}
const stopStreamPoll = () => {
  if (streamTimer) {
    clearInterval(streamTimer)
    streamTimer = null
  }
}

/* =========================
   라이프사이클
   ========================= */
const cleanupAll = async () => {
  await Promise.all(Object.keys(mjpegSrc).map(k => stopStream(Number(k))))
}

onUnmounted(() => { cleanupAll(); stopStreamPoll() })
onDeactivated(() => { cleanupAll(); stopStreamPoll() })

onMounted(async () => {
  await loadConfig()
  // 초기 선택에 대해 스트림 오픈
  for (const idx of selected.value) await openStream(idx)
  startStreamPoll()
})
</script>

<style scoped>
.camera-wrapper {
  display: flex;
  height: 75vh;
  overflow: hidden;
  position: relative;
}

.camera-select {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.camera-select select {
  background-color: white;
  color: black;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  appearance: auto;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  height: 48px;
  box-sizing: border-box;
}

.reset-button {
  font-size: 12px;
  padding: 4px 8px;
  /* background-color replaced by inline style */
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.camera-sidebar {
  width: 240px;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  height: 100%;
  border-radius: 6px;
}

.camera-list-title {
  font-size: 18px;
  font-weight: bold;
}

.camera-item {
  padding: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ddd;
  font-size: 14px;
}

.camera-item.active {
  color: white;
}

.camera-page {
  flex: 1;
  overflow: hidden;
  padding-left: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.camera-grid {
  flex: 1;
  display: grid;
  gap: 8px;
  height: 100%;
}

.camera-cell {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.camera-feed {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.camera-name {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  /* background-color replaced by inline style */
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  z-index: 1;
}

.grid-1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.grid-2 {
  grid-template-columns: 1fr;
  grid-template-rows: repeat(2, 1fr);
}

.grid-2x2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.grid-3x3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.camera-cell.empty {
  background: black;
}

.dark-mode .camera-sidebar {
  background: black;
  color: white;
}

.dark-mode .camera-cell {
  background: black;
}

.light-mode .camera-sidebar {
  background: #f2f2f2;
}

.light-mode .camera-item {
  background: #ffffff;
  color: #222;
}

.light-mode .camera-cell {
  background: #f0f0f0;
}

.light-mode .camera-cell.empty {
  background: #e0e0e0;
}

@media (max-width: 600px) {
  .camera-sidebar {
    display: none;
  }

  .camera-select {
    margin-bottom: 8px;
  }

  .camera-page {
    padding-top: 80px;
    padding-left: 0;
  }
}
</style>
