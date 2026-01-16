// 사용자 Event에 대한 처리 유틸
// eslint-disable-next-line import/no-cycle
import { useLogsStore } from '@hiway/stores/logs'
import { themeConfig } from '@themeConfig'

const DEBUG_MODE = !!themeConfig.app.showDetailLog

const PREFIX = {
  START: '[UI START]',
  INFO: '[UI]',
}

const logger = {
  init(Vue) {
    const logsStore = useLogsStore()

    // 초기화
    if (DEBUG_MODE) console.log('=== Global Logging Info ===')
    if (DEBUG_MODE) console.log('navigator.userAgent:', navigator.userAgent)    

    // 전체 Click Event 처리
    document.addEventListener('click', e => {
      if (DEBUG_MODE) console.log('GLOBAL:', e.target)

      // 일반 버튼 클릭 시 처리 이벤트
      if (e.target.type === 'button') {
        if (DEBUG_MODE) {
          console.log('Button Action ID:', e.target.dataset.actionId)
        }
        if (DEBUG_MODE) console.log('Currnet Menu Name:', logsStore.name)
      }
    })

    // Vue 내부에서 발생한 에러 캐치
    Vue.config.errorHandler = err => console.error(err)
  },

  // 로딩 간 로딩 내역 출력 전용
  start(...logParams) {
    if (!DEBUG_MODE) return
    console.log(PREFIX.START, ...logParams)
  },
  info(...logParams) {
    if (!DEBUG_MODE) return
    console.log(PREFIX.INFO, ...logParams)
  },  
}

export default logger
