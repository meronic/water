import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL // ← env만 사용

const trimRightSlash = s => (s || '').replace(/\/+$/, '')

export const axiosIns = axios.create({
  baseURL: trimRightSlash(baseURL),
  timeout: 15000,
})

axiosIns.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
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
      // 필요 시 처리: 예) window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default axiosIns
