import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCameraModalStore = defineStore('cameraModal', () => {
  const visible = ref(false)
  const camIndex = ref(null)

  const open = (index) => {
    camIndex.value = index
    visible.value = true
  }

  const close = () => {
    visible.value = false
    camIndex.value = null
  }

  return {
    visible,
    camIndex,
    open,
    close,
  }
})
