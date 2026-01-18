import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockEvents from './mock/events.json'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** ✅ 이벤트 목록 조회 */
export async function getEventList(params) {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/event/list`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false,
      },
      params : params 
    })    
  }
  
  // 🔧 Mock 데이터 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEvents || [])
    }, 300)
  })
}

/** ✅ (선택) 이벤트 등록 */
export async function insertEvent(payload) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/event/insert`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data : payload
    })    
  }
  
  // 🔧 Mock 응답
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 300)
  })
}

