import axios from 'axios'
import { getToken } from '@hiway/utils/token'

const baseURL = import.meta.env.VITE_API_BASE_URL // ← env만 사용

const trimRightSlash = s => (s || '').replace(/\/+$/, '')

export const axiosIns = axios.create({
  baseURL: trimRightSlash(baseURL),
  timeout: 15000,
})

axiosIns.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers['X-Auth-Token'] = token
  }
  return config
})

axiosIns.interceptors.response.use(
  res => res,
  err => {
    console.error('[API ERROR]', {
      url: err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    })
    if (err.response?.status === 401) {
      // 401: 토큰 만료 또는 유효하지 않음
      console.warn('🔴 401 인증 실패 - 토큰 재인증 필요')
      // 필요시 처리: 예) window.location.href = '/login'
    } else if (err.response?.status === 403) {
      // 403: 권한 부족
      console.warn('🟡 403 권한 부족')
    }
    return Promise.reject(err)
  }
)

export default axiosIns
