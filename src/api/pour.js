import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockCumulativePours from './mock/cumulativePours.json'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 누적 주수량 조회 */
export async function getCumulativePour({ ship_no, tank_name }) {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/pour/cumulative`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      },
      params: { ship_no, tank_name }
    })    
  }
  
  // Mock 데이터 필터링
  const filtered = mockCumulativePours.filter(cp =>
    cp.ship_no === ship_no && cp.tank_name === tank_name
  )
  return filtered
}

/** 누적 주수량 전체 조회 */
export async function getAllCumulativePours() {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/pour/cumulative/all`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      }
    })    
  }
  
  return mockCumulativePours
}
