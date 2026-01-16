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