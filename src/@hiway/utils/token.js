const TokenKey = 'Token'

export function getToken() {
  return window.sessionStorage.getItem(TokenKey)
}

export function setToken(token) {
  return window.sessionStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return window.sessionStorage.removeItem(TokenKey)
}

export function getIsBeforeRemoveToken() {
  return window.sessionStorage.getItem('isbeforeRemoveToken')
}

export function setIsBeforeRemoveToken(value) {
  return window.sessionStorage.setItem('isbeforeRemoveToken', value)
}

export function removeIsBeforeRemoveToken() {
  return window.sessionStorage.removeItem('isbeforeRemoveToken')
}