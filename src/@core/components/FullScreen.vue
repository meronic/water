<script setup>
import { useCommonStore } from '@hiway/stores/common'

const commonStore = useCommonStore()

const callFullScreen = () => {
  if (!document.fullscreenElement) {    
    commonStore.isFullScreen = true
    document.documentElement.requestFullscreen()
  } else if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}
</script>

<template>  
  <VBtn
    icon
    variant="text"
    color="default"
    size="small"
  >
    <VIcon
      icon="mdi-arrow-expand-all"      
      size="24"
      @click="callFullScreen"
    />
  </VBtn>
</template>   