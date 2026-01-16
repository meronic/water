import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockEvents from './mock/events.json'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** ✅ 이벤트 목록 조회 */
export async function getEventList(params) {
  /*
  const { data } = await axiosIns.get('/event/list', { params })
  return data || []
  */
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
  
  return mockEvents || []
}

/** ✅ (선택) 이벤트 등록 */
export async function insertEvent(payload) {
  /*
  const { data } = await axiosIns.post('/event/insert', payload)
  return data === 'success' || data?.success === true
  */

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
}
