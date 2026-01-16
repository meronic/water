/**
 * 점검 로직이 필요할 경우 이곳에 정리
 */
import { themeConfig } from '@themeConfig'

// isUseTargetAPI에 사용되며, 각 API Context Root 별로 사용하기 위해서 플레그 값을 정의
const USE_API = {
  IOT: true,
}

export function isIE11() {
  return navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0
}

export function isMobile() {
  const mobileArr = ['iPhone', 'iPod', 'BlackBerry', 'Android', 'Windows CE', 'LG', 'MOT', 'SAMSUNG', 'SonyEricsson']

  // eslint-disable-next-line no-restricted-syntax
  for (const txt in mobileArr) {
    if (navigator.userAgent.match(mobileArr[txt]) != null) {
      return true
    }
  }

  return false
}

export function getAgentType() {
  const agentTypes = ['Electron', 'Cordova', 'Android', 'iOS', 'Windows', 'OSX']

  const checkedTypes = []

  // eslint-disable-next-line no-restricted-syntax
  for (const idx in agentTypes) {
    if (navigator.userAgent.match(agentTypes[idx]) != null) {
      checkedTypes.push(agentTypes[idx])
    }
  }

  if (checkedTypes.includes('Electron')) return 'Electron'
  if (checkedTypes.includes('Cordova')) return 'HybridWeb'
  if (checkedTypes.includes('Android') || checkedTypes.includes('iOS')) {
    return 'MobileWeb'
  }

  return 'PCWeb'
}

export function isUseAPI(frcflag) {
  // local 개발 환경 flag
  const isLocal = process.env.NODE_ENV !== 'production'

  if (typeof frcflag === 'boolean') return frcflag

  if (themeConfig.app.onlyMockup) return false

  return !isLocal || themeConfig.app.useRestfulAPI
}

export function isUseTargetAPI(target) {
  // local 개발 환경 flag
  const isLocal = process.env.NODE_ENV !== 'production'

  if (themeConfig.app.onlyMockup) return false

  return !isLocal || themeConfig.app.useRestfulAPI || USE_API[target]
}

// 터치원으로 접속했는지 여부를 확인하기 위한 함수
export function isTouchOneLogin() {
  return !!(touchOneObj.browser === 'ANDROID' || touchOneObj.browser === 'IOS')
}
