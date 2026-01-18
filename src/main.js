/* eslint-disable import/order */
// import './sw-register'
import '@/@iconify/icons-bundle'
import App from '@/App.vue'
import layoutsPlugin from '@/plugins/layouts'
import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import router from '@/router'
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import i18n from '@/plugins/i18n'
import Notifications from '@kyvg/vue3-notification'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import logger from '@hiway/utils/log'

// import bus from '@/utils/eventHandler'
import directives from '@hiway/directives'

loadFonts()


// Create vue app
const app = createApp(App)

// app.config.globalProperties.$bus = bus

// Use plugins
app.use(vuetify)
app.use(createPinia())
app.use(router)
app.use(layoutsPlugin)
app.use(i18n)
app.use(Notifications)
app.use(VueSweetalert2)
app.use(directives)
logger.init(app)

// Mount vue app
app.mount('#app')

window._vue = app

// 🔍 디버깅용 전역 함수 추가
window.__DEBUG__ = {
  checkToken: () => {
    const token = window.sessionStorage.getItem('Token')
    console.log('📌 Token:', token ? token.substring(0, 30) + '...' : 'NONE')
    return token
  },
  checkLocalStorage: () => {
    console.log('📌 LocalStorage:', {
      userData: localStorage.getItem('userData'),
      accessToken: localStorage.getItem('accessToken'),
      access_token: localStorage.getItem('access_token'),
    })
  },
  checkSessionStorage: () => {
    console.log('📌 SessionStorage:', {
      Token: window.sessionStorage.getItem('Token') ? 'EXISTS' : 'NONE',
    })
  },
  checkAPI: () => {
    console.log('📌 API 설정:', {
      VITE_HIWAY_API_URL: import.meta.env.VITE_HIWAY_API_URL,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    })
  },
  fullDiagnosis: () => {
    console.group('🔍 AUTH FULL DIAGNOSIS')
    window.__DEBUG__.checkToken()
    window.__DEBUG__.checkLocalStorage()
    window.__DEBUG__.checkSessionStorage()
    window.__DEBUG__.checkAPI()
    console.groupEnd()
  },
}

console.log('💡 디버깅: 콘솔에서 __DEBUG__.fullDiagnosis() 실행')
