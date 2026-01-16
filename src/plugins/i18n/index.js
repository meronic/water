import { createI18n } from 'vue-i18n'
import { getI18nSet } from '@hiway/api/lang'
import localStore from '@/utils/localStore'

export const storedLocale = localStore.get('locale') || 'ko'

const messages = Object.fromEntries(Object.entries(
  import.meta.glob('./locales/*.json', { eager: true }))
  .map(([key, value]) => [key.slice(10, -5), value.default]))

const loadedLanguages = []

const changeLocale = (i18n, lang) => {    
  i18n.locale.value = lang
  localStore.set('locale', lang)

  const changeLocaleEvent = new CustomEvent('changeLocale', {
    detail: {
      lang,
    },
  })

  window.dispatchEvent(changeLocaleEvent)
}

const i18n = createI18n({
  legacy: false,
  locale: 'ko',
  fallbackLocale: 'ko',
  messages,
})

export const loadLanguageAsync = (i18n, lang) => {
  if(loadedLanguages.includes(lang)) {
    changeLocale(i18n, lang)
    
    return
  }  
  getI18nSet(lang).then(msgs => {
    const setObj = {}

    msgs.forEach(msg => {
      setObj[msg.id] = e=>{
        const { normalize: l } = e
        
        return l([msg.text])
      }
    })
    loadedLanguages.push(lang)

    i18n.mergeLocaleMessage(lang, setObj)

    changeLocale(i18n, lang)
  })
}

const remoteLangKo = () => import('remote_app/remoteLangKo')
const remoteLangEn = () => import('remote_app/remoteLangEn')

remoteLangKo().then(res => {  
  i18n.global.mergeLocaleMessage('ko', res.default)
})

remoteLangEn().then(res => {
  i18n.global.mergeLocaleMessage('en', res.default)
})

export default i18n