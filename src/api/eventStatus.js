import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockEventStatus from './mock/eventStatus.json'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 이벤트 현황 조회 */
export async function getEventStatus() {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/event/status`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      }
    })    
  }
  
  return mockEventStatus
}

/** 특정 이벤트 타입별 현황 */
export async function getEventStatusByType(type) {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/event/status/${type}`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      }
    })    
  }
  
  const found = mockEventStatus.find(es => es.event_type === type)
  return found ? [found] : []
}
