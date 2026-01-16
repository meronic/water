<template>
  <VOverlay  
    id="loading-overlay"
    v-model="loading"
    scroll-strategy="none"
    opacity="0"
    class="align-center justify-center text-center"    
    z-index="99999"    
    persistent
  >
    <!--
      <VCard
      width="150"
      height="150"
      class="py-8"
      color="rgba( 0, 0, 0, 0.5)"
      >
      <VProgressCircular      
      indeterminate
      color="white"
      size="44"
      />
      <p
      class="mt-5 mb-0"
      style="color: white"
      >
      로딩중입니다.
      </p>       
      </VCard> 
    -->
    <VCard    
      width="300"
      height="80"
      class="py-4"
      color="rgba( 0, 0, 0, 0.5)"
    >
      <p
        class="mb-4"
        style="color: white"
      >
        로딩중입니다.
      </p>
      <v-progress-linear
        color="primary"
        indeterminate
        rounded
        height="6"
      />
    </VCard>
  </VOverlay>
</template>
  
<script setup>
import { useCommonStore } from '@hiway/stores/common'
import { storeToRefs } from 'pinia'

const { loading } = storeToRefs(useCommonStore())
const test = true
</script>

<style lang="scss">
#loading-overlay {
  .v-overlay__scrim {
      background: no-repeat !important
    }
}    
</style>