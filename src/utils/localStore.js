/**
 * localstorage에 값을 저장하는 util
 */

export default {
  get: key => localStorage.getItem(key),
  set: (key, stringData) => {
    if (typeof stringData !== 'string') {
      console.error('localStore [error]:', 'string Data is not string. only string.')
    } else {
      localStorage.setItem(key, stringData)
    }
  },
}
  