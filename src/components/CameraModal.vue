<script setup>
import { computed, onBeforeUnmount, ref, watch, nextTick, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useCameraModalStore } from '@/stores/cameraModal'
import axiosIns from '@/plugins/axios'
import { getMjpegUrl } from '@/api/camera'

import cam1 from '../assets/images/avatars/avatar-1.png'
import cam2 from '../assets/images/avatars/avatar-2.png'
import cam3 from '../assets/images/avatars/avatar-3.png'
import cam4 from '../assets/images/avatars/avatar-4.png'
import cam5 from '../assets/images/avatars/avatar-5.png'
import cam6 from '../assets/images/avatars/avatar-6.png'
import cam7 from '../assets/images/avatars/avatar-7.png'
import cam8 from '../assets/images/avatars/avatar-8.png'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
})

const camImages = [cam1, cam2, cam3, cam4, cam5, cam6, cam7, cam8]
const cameraModal = useCameraModalStore()

const camImage = computed(() =>
  cameraModal.camIndex !== null ? camImages[cameraModal.camIndex] : ''
)

/* =========================
   Theme
   ========================= */
const { global: theme } = useTheme()
const isDark = computed(() => theme.current.value.dark)

/* =========================
   MJPEG (camIndex === 0)
   ========================= */
const imgRef = ref(null)
const mjpegSrc = ref('')          // /camera/mjpeg-url 로 받은 /mjpeg64 URL
const isDisconnected = ref(false) // 표시용

// 스트림 열기: 백엔드에서 URL 받아 img src에 꽂기
const openMjpeg = async () => {
  await nextTick()

  // if (cameraModal.camIndex !== 0) return // cam0만 실스트림

  try {
    const data = await getMjpegUrl(cameraModal.camIndex)

    if (data?.ok && data?.url) {
      // 캐시버스트로 재연결 강제
      mjpegSrc.value = `${data.url}&v=${Date.now()}`
      isDisconnected.value = false
    } else {
      mjpegSrc.value = ''
      isDisconnected.value = true
    }
  } catch (e) {
    console.error('[CameraModal] openMjpeg error', e)
    mjpegSrc.value = ''
    isDisconnected.value = true
  }
}

// 스트림 닫기: img src 비우기 (pull형이라 이것만으로 종료)
const closeMjpeg = () => {
  mjpegSrc.value = ''
  isDisconnected.value = false
}

/* =========================
   시각 오버레이
   ========================= */
const currentTime = ref('')
let clockTimer = null

const updateTime = () => {
  const now = new Date()

  currentTime.value = now.toLocaleTimeString('ko-KR', { hour12: false })
}

/* =========================
   모달 열림/닫힘 감시
   ========================= */
watch(
  () => cameraModal.visible,
  async (val) => {
    if (val && cameraModal.camIndex !== null) {
      // 시계 시작
      updateTime()
      clockTimer = setInterval(updateTime, 1000)

      // cam0만 MJPEG 오픈
      if (cameraModal.camIndex === 0) {
        await openMjpeg()
      } else {
        // 다른 cam은 고정 이미지
        closeMjpeg()
      }
    } else {
      // 모달 닫힘
      if (clockTimer) {
        clearInterval(clockTimer)
        clockTimer = null
      }
      closeMjpeg()
    }
  }
)

/* 이미지 이벤트: multipart라 모든 프레임에 load가 오진 않지만,
   최초 연결 실패/끊김 감지는 유용 */
const onImgError = () => {
  isDisconnected.value = true

  // 필요 시 간단 재시도
  setTimeout(() => {
    if (cameraModal.visible && cameraModal.camIndex === 0) {
      openMjpeg()
    }
  }, 1500)
}

const onImgLoad = () => {
  isDisconnected.value = false
}

onMounted(() => {
  // 이미 열린 상태로 진입했을 때 안전
  if (cameraModal.visible) {
    updateTime()
    clockTimer = setInterval(updateTime, 1000)
    if (cameraModal.camIndex === 0) openMjpeg()
  }
})

onBeforeUnmount(() => {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
  closeMjpeg()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="cameraModal.visible"
      class="camera-modal-overlay"
      :class="[isDark ? 'dark-mode' : 'light-mode']"
      @click.self="cameraModal.close"
    >
      <div class="camera-modal-bottom">
        <button
          class="modal-close"
          @click="cameraModal.close"
        >
          X
        </button>

        <!-- cam0: 실 스트림(MJPEG), 그 외: 아바타 이미지 -->
        <img
          v-if="cameraModal.camIndex === 0"
          ref="imgRef"
          :src="mjpegSrc || camImage"
          class="modal-camera-feed"
          alt="camera-large"
          @error="onImgError"
          @load="onImgLoad"
        >
        <img
          v-else-if="cameraModal.camIndex !== null"
          :src="camImage"
          class="modal-camera-feed"
          alt="camera-large"
        >

        <div class="overlay-bottom-right">
          {{ currentTime }}
        </div>
        <div
          v-if="isDisconnected"
          class="overlay-center"
        >
          ⚠ 연결 끊김
        </div>

        <div class="camera-name modal-name">
          {{ props.title && props.title.trim()
            ? props.title
            : `Camera ${Number(cameraModal.camIndex ?? -1) + 1}` }}
        </div>
      </div>
    </div>
  </Teleport>
</template>


<style scoped>
.camera-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.camera-modal-bottom {
  position: relative;
  width: 100%;
  height: 87%;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dark-mode .camera-modal-bottom {
  background: black;
}
.dark-mode .modal-close {
  color: white;
}
.dark-mode .modal-name {
  background-color: #754bcb;
  color: white;
}
.light-mode .camera-modal-bottom {
  background: #f9f9f9;
}
.light-mode .modal-close {
  color: #222;
}
.light-mode .modal-name {
  background-color: #754bcb;
  color: white;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 10;
}

.modal-camera-feed {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
}

.modal-name {
  position: absolute;
  top: 11px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  padding: 4px 10px;
  border-radius: 4px;
  z-index: 2;
}

.overlay-top-left {
  position: absolute;
  top: 10px;
  left: 10px;
  color: red;
  font-weight: bold;
  font-size: 14px;
  z-index: 3;
}

.overlay-bottom-right {
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  z-index: 3;
}

.overlay-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 16px;
  z-index: 3;
}

@media (max-height: 750px) {
  .camera-modal-bottom {
    height: 82%;
  }
}
</style>
