/**
 * Return if user is logged in
 * This is completely up to you and how you want to store the token in your frontend application
 * e.g. If you are using cookies to store the application please update this function
 */
import { useMenuStore } from "@hiway/stores/menu"
import EventHandler from '@hiway/utils/eventHandler'
import { getToken, removeToken, getIsBeforeRemoveToken, removeIsBeforeRemoveToken } from '@hiway/utils/token'
import { themeConfig } from '@themeConfig'

export const isUserLoggedIn = () => !!(getToken())

// ✅ Mock 모드: 권한 체크 비활성화 (UI 테스트 전용)
export const isMockMode = () => themeConfig.app.onlyMockup === true

// eslint-disable-next-line sonarjs/cognitive-complexity
export const canNavigator = to => {  
  // 🔧 Mock 모드: 모든 페이지 접근 허용
  if (isMockMode()) {
    console.log('🧪 Mock 모드: 권한 체크 생략, 모든 페이지 접근 허용')
    return true
  }

  const menuStore = useMenuStore()

  // ✅ 권한 체크 실패 시 fallback: dashboard 접근 허용
  // (관리자 계정이 메뉴 미로드되어 있어도 기본 페이지 접근 가능)
  if (!menuStore.menus || menuStore.menus.length === 0) {
    return true
  }

  const permittedMenus = menuStore.menus
  
  // eslint-disable-next-line sonarjs/cognitive-complexity
  return permittedMenus.some(menu => {    
    if (menu.mnu_act === 'H') {
      const permittedPathArr = menu.href.split('/')
      const asteriskIndexArr = []
      let idx = permittedPathArr.indexOf('*')
      while (idx !== -1) {
        asteriskIndexArr.push(idx)
        idx = permittedPathArr.indexOf('*', idx + 1)
      }
      if (asteriskIndexArr.length > 0) {
        const checkingPathArr = to.path.split('/')
        if (permittedPathArr.length === checkingPathArr.length) {
          for (let i = 0; i < permittedPathArr.length; i++) {
            if (!asteriskIndexArr.includes(i) && permittedPathArr[i] !== checkingPathArr[i]) {              
              return false              
            }
          }
          
          return true
        }
      }
    }
    
    return menu.href === to.path
  })  

}
export const isMenuLoaded = () => {
  const menuStore = useMenuStore()

  return menuStore.menus.length > 0    
}

export const atuhCheck = (to, from, next) => {

  if(getIsBeforeRemoveToken()) {
    removeIsBeforeRemoveToken()
  }

  if (to.meta.removeToken) {            
    removeToken()
  }

  // 권한 체크 안하는 화면
  if(to.meta.noAuth) {           
    return next()
  }

  // login시 접근 못하는 화면
  if(to.meta.redirectIfLoggedIn) {    
    if(getToken()) {
      return next('/')
    } else {
      return next()
    }
  }

  // 🧪 Mock 모드: 권한 체크 비활성화, 모든 페이지 즉시 접근 허용
  if (isMockMode()) {
    // 로그인 토큰 없으면 mock token 설정
    if (!getToken()) {
      console.log('🧪 Mock 모드: 임시 토큰 설정')
      const mockToken = 'mock-admin-token-' + Date.now()
      localStorage.setItem('mockToken', mockToken)
    }
    return next()
  }

  // 로그인 시
  if(getToken()) {  
    if(isMenuLoaded()) {
      if(canNavigator(to)) {
        // 권한있는 메뉴
        return next()
      } else {
        // 권한없는 메뉴
        return next('/not-authorized')
      }
    } else {
      // ✅ 메뉴 미로드 시에도 기본 경로는 허용 (타임아웃 대비)
      if (to.path === '/' || to.path.includes('dashboard')) {
        return next()
      }
      
      EventHandler.once(() => {
        if(canNavigator(to)) {
          // 권한있는 메뉴
          return next()
        } else {
          // 권한없는 메뉴
          return next('/not-authorized')
        }
      }, 'loaded-menu')
    }    
  } else {
    // 비로그인    
    return next('/login')
  }
}
