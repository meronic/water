<script setup>
import { useTheme } from 'vuetify'
import { useThemeConfig } from '@core/composable/useThemeConfig'
import { hexToRgb } from '@layouts/utils'
import { getToken, getIsBeforeRemoveToken } from '@hiway/utils/token'
import { useUserStore } from '@hiway/stores/user'
import { useMenuStore } from '@hiway/stores/menu'
import { storedLocale, loadLanguageAsync } from '@/plugins/i18n'
import { useI18n } from 'vue-i18n'
import LoadingDialog from '@layouts/components/LoadingDialog.vue'
import { useCommonStore } from '@hiway/stores/common'
import { getCurrentInstance } from 'vue'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import { i18nInit } from '@hiway/utils/validation'
import EventHandler from '@hiway/utils/eventHandler'
import touchOneCallbackFn from '@hiway/utils/touchOne'
import { isTouchOneLogin } from '@hiway/utils/check'
// import { useShipStore } from '@/stores/shipStore'

const vm = getCurrentInstance().proxy

const {
  syncInitialLoaderTheme,
  syncVuetifyThemeWithTheme: syncConfigThemeWithVuetifyTheme,
  isAppRtl,
} = useThemeConfig()

const { global } = useTheme()



watch(
  () => global.name.value,
  (val) => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(val)
  },
  { immediate: true }
)

const getUserAuth = () => {
  const token = getToken()
  const userStore = useUserStore()
  const { getMenus, getMyMenus } = useMenuStore()

  // 새로 화면이 불러오면 user Info 정보를 가져온다.
  // (토큰 값이 있어도 조회가 안될 수 있는 경우) request 상위에서 에러가 발생하면 무시된다.
  if (token && !getIsBeforeRemoveToken()) {
    userStore.setUserInfo().then(res => {
      getMenus()
      getMyMenus()
    })
  }
}

const commonStore = useCommonStore()
const router = useRouter()
// const shipStore = useShipStore()

commonStore.addFullScreenListener()

onMounted(() => {
  if (navigator.userAgent.includes('Safari') && !(navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('CriOS'))) {
    return
  }
  document.body.id = commonStore.systemCode
  // if (!shipStore.shipList.length) {
  //   shipStore.fetchAndInitShipList()
  //   shipStore.startBackgroundEngine()
  // }
  // SmartOne
  if (isTouchOneLogin()) {
    let userSpec = {
      type: 'userInfo'
    }
    userSpec = JSON.stringify(userSpec)
    touchOneObj.getUserInfo('cbGetReturnValInTouchOne', userSpec)
  }
  
})

// onBeforeUnmount(() => {
//   if (!shipStore.shipList.length) {
//     shipStore.stopBackgroundEngine()
//   }
// })

// ℹ️ Sync current theme with initial loader theme
syncInitialLoaderTheme()
syncConfigThemeWithVuetifyTheme()
loadLanguageAsync(useI18n(), storedLocale)
getUserAuth()
i18nInit()

// SmartOne
const touchOneObj = new mfnpObj()
window.touchOneObj = touchOneObj
window.cbGetReturnValInTouchOne = touchOneCallbackFn

const callSetUserInfoTouchOne = () => {
  const token = getToken()

  const userStore = useUserStore()
  const menuStore = useMenuStore()

  if (token) {
    userStore.setUserInfo().then(() => {
      menuStore.getMenus()
      menuStore.getMyMenus()

      const mobileHome = import.meta.env.VITE_MOBILE_HOME
      if (mobileHome !== null && mobileHome !== '' && mobileHome !== 'undefined') {
        router.push(mobileHome)
      } else {
        router.push('/')
      }
    })
  }
}

EventHandler.once(() => {
  callSetUserInfoTouchOne()
}, 'touchOneLogin')
</script>

<template>
  <VLocaleProvider :rtl="isAppRtl">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <LoadingDialog />
      <RouterView />
      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
  <notifications group="hiway" position="top center" :durations="2000" :width="300" style="top: 50px;" />
</template>
