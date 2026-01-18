import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockSettings from './mock/settings.json'

const contextPath = import.meta.env.VITE_API_BASE_URL

export async function getWebSettings() {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/setting/read`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false,
      },
    })    
  }
  
  // 🔧 Mock 데이터
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSettings)
    }, 300)
  })
}

export async function saveWebSettings(payload) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/setting/value`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: payload
    })    
  }
  
  // 🔧 Mock 응답
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 300)
  })
}
