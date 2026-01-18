import axios from 'axios'
import { getToken, setToken } from '@hiway/utils/token'
import { themeConfig } from '@themeConfig'
import { random } from 'lodash-es'
import { useCommonStore } from '@hiway/stores/common'
import dayjs from 'dayjs'
import router from '@/router'
import { useUserStore } from '@hiway/stores/user'
import { useLogsStore } from '@hiway/stores/logs'
// 🧪 Mock 모드 확인
const isMockMode = () => themeConfig.app.onlyMockup === true
let loadingQueue = []
const ladingTerm = 500
let swal = null
let isInit = false

const init = () => {  
  swal = window._vue.config.globalProperties.$swal  
  isInit = true
}

const _getDefaultMeta = () => {
  return {
    useTokenUpdate: false, // 받아온 response에서 token 값을 가져와 재 셋팅을 할 경우 true로 셋팅한다.
    useAuth: true, // 인증 모듈을 사용한다. false가 되었을 경우 401 상태에서도 Login 화면으로 가지 않는다. (i18n과 같은 특별한 경우에서만 사용)
    apiVersion: themeConfig.app.apiVersion, // API 버전을 호출 API 별로 정의 한다. 기본 값은 envs에 정의한 값으로 셋팅된다.
    useErrorMessage: true, // response 시, 에러가 날 경우 에러 메시지를 출력하는 여부를 셋팅한다. 기본은 true
    useResponseAll: false, // request 실행 이후, API로 돌아오는 Obj를 Axios response 전문으로 변경되어 전달한다. 기본은 false
    useProgress: true, // API 사용 간 Global Lock Progressive Bar 를 사용하는 것을 의미.    
  }
}

const clearLoadingProgress = () => {
  loadingQueue = []

  const commonStore = useCommonStore()
    
  commonStore.loading = false  
}

const checkLoadingProgress = meta => {
  const now = new Date()
  let target = loadingQueue.find( loading => loading.key === meta.logkey) || { time: now }  
  
  if(!target) {
    target = {
      time: now,
    }
  }

  const loadingTime = now - target.time  
  
  setTimeout(() => {
    target.done = true
    
    if(loadingQueue.every(q => q.done)) {
      clearLoadingProgress()
    }

  }, ladingTerm)
  
  return loadingTime
}

const service = axios.create({
  baseURL: '/',
  timeout: 20000, // timeout은 20초로 설정  
})

service.interceptors.request.use(
  config => {                
    if(!isInit) init()    

    const commonStore = useCommonStore()
    const logsStore = useLogsStore()
    const configSetting = config
    const systemCode = commonStore.systemCode
    const logKey = dayjs().format(`YYYYMMDDHHmmssSSS${systemCode}${random(1000, 9999)}`)

    // meta 구성
    if (!configSetting.meta) configSetting.meta = {}
    configSetting.meta = Object.assign(_getDefaultMeta(), config.meta)
    configSetting.meta.logkey = logKey

    // loading progress
    if(configSetting.meta.useProgress) {            
      commonStore.loading = true    
    }

    // header 구성
    const token = config.meta.authToken || getToken()
    config.headers['X-Auth-Token'] = token
    
    // 🔍 디버그: 요청 시 토큰 확인
    if (!token) {
      console.warn('⚠️ [REQUEST] 토큰 없음!', {
        url: config.url,
        method: config.method,
      })
    } else {
      console.log('✅ [REQUEST] 토큰 포함:', {
        url: config.url,
        method: config.method,
        token: token.substring(0, 20) + '...',
      })
    }
    
    configSetting.headers['X-APIVERSION'] = config.meta.apiVersion
    configSetting.headers['X-LOGKEY'] = logKey
    configSetting.headers['X-CHANNEL'] = `WEB_${logsStore.agentType}`
    configSetting.headers['X-VNAME'] = 'UI'
    configSetting.headers['X-LANG'] = localStorage.getItem('locale') || 'ko'
    configSetting.headers['X-MID'] = logsStore.name    
    configSetting.headers['X-CALLTYPE'] = '0'
    configSetting.headers['X-APP'] = systemCode    

    loadingQueue.push({
      key: logKey,
      done: false,
      time: new Date(),
    })    

    return configSetting        
  },
  error => {
    console.error('REQUEST error', error)
    clearLoadingProgress()

    const { meta } = error.request.config

    if(meta.useErrorMessage) {
      swal({ icon: 'error', text:error.message, width: 500 })
    }
    
    return Promise.reject(error)    
  },
)

service.interceptors.response.use(
  // eslint-disable-next-line sonarjs/cognitive-complexity
  response => {    
    const { meta } = response.config    

    const execTime = checkLoadingProgress(response.config.meta)

    // vm.$swal({ icon: 'error', text:'API테스트 에러 ', width: 300 })
    let res = {}

    if (response.data && response.data.datas) {
      res = response.data.datas
    } else if (response.data && response.data.data !== undefined && response.data.data !== null) {
      res = response.data.data
    } else if (response.data && response.data.dataList) {
      res = response.data.dataList
    } else {
      res = response.data
    }

    // res 규격이 Object가 아닐 경우 Object로 셋팅
    if (!Array.isArray(res) && typeof res !== 'object') {
      res = {
        body: res,
      }
    }

    if (response.data && response.data.result) {
      if (typeof response.data.result === 'object') {
        res.result = response.data.result
      } else res.result = {}
    } else {
      res.result = {}
    }
    res.result.execTime = execTime
    res.result.resMsg = ''

    if (res.result.total) {
      const tmpl = template(
        `${res.result.total}건 중, ${res.result.success}건 성공, ${res.result.fail}건 실패. ${res.result.execTime}ms`,
      )

      const t = res.result.total

      res.result.resMsg = tmpl({
        total: t.count,
        success: t.success,
        fail: t.fail,
        execTime,
      })
    }
    
    if (meta.useTokenUpdate) {      
      const token = response.headers['hiway-x-auth-token'] || response.headers['x-auth-token']
      if (token) {
        console.log('✅ 토큰 업데이트:', token.substring(0, 20) + '...')
        setToken(token)
      } else {
        console.warn('⚠️ 토큰 헤더 없음. 응답 헤더:', Object.keys(response.headers))
      }
    }

    // file download
    if (meta.getContentDisposition) {
      res.contentDisposition = response.headers['content-disposition']
    }
    

    // Axios 전문을 원할 경우 아래의 meta 값을 셋팅해서 사용한다.
    if (meta.useResponseAll) return response

    return res
  },
  error => {
    console.log('msg >>>', error.message) // for debug
    console.error('error :', error)
        
    let meta = {}

    let status = '499'
    let msg = error.message
    
    if(error.response && error.response.config) {
      meta = error.response.config.meta
      checkLoadingProgress(meta)
    } else {
      meta = _getDefaultMeta()
      clearLoadingProgress()
    }

    if (error.response) {
      if (error.response.data && error.response.data.result && error.response.data.result.desc) {
        msg = error.response.data.result.desc
      }
      
      // 🔍 API 상세 정보 로깅
      console.warn('⚠️  [API ERROR]', {
        status: error.response.status,
        url: error.config?.url,
        method: error.config?.method,
        message: msg,
      })
      
      if(meta.useAuth && error.response.status === 401) {
        // 401 error - Mock 모드에서는 무시
        if (isMockMode()) {
          console.log('🧪 Mock 모드: 401 에러 무시하고 계속 진행')
          return Promise.resolve({})
        }
        
        console.warn('❌ 401 Unauthorized - 토큰 유효하지 않음 또는 만료됨')
        msg = '인증이 실패했습니다. 다시 로그인해주세요.'
        removeToken()
        useUserStore().clear()
        // 로그인 페이지로 리다이렉트
        setTimeout(() => {
          console.log('➡️  로그인 페이지로 리다이렉트')
          router.push('/login')
        }, 500)
      } else if(meta.useAuth && error.response.status === 403) {
        // 403 error - 권한 부족
        console.warn('⛔ 403 Forbidden - 권한 부족')
        msg = '접근 권한이 없습니다.'
      }

      status = error.response.status    
    } else if (isMockMode()) {
      // 🧪 Mock 모드: 네트워크 에러도 무시
      console.warn('🧪 Mock 모드: 네트워크 에러 무시하고 계속 진행', error.message)
      return Promise.resolve({})
    }

    if(meta.useErrorMessage && !isMockMode()) {
      swal({ icon: 'error', text:msg, width: 500 })
    }
    
    // 🧪 Mock 모드: 에러 무시하고 계속 진행
    if (isMockMode()) {
      console.log('🧪 Mock 모드: 에러 무시')
      return Promise.resolve({})
    }
          
    return Promise.reject(error)    
  },
)

export default service
