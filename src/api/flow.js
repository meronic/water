import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockFlows from './mock/flows.json'
import mockHourlyPours from './mock/hourlyPours.json'
import mockCumulativePours from './mock/cumulativePours.json'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 다운 그래프 데이터 조회 */
export async function getDownGraph({ unit, shipNo }) {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/flow/down/graph`,
      method: 'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      },
      
      params: { unit, shipNo } 
    })    
  }
  
  // Mock 데이터 반환 - 시간별 주수량
  return mockHourlyPours
}

export async function getFlowLastTime({ ship_no, tank_name }) {
  /*
  const { data } = await axiosIns.get('/flow/last-time', {
    params: { ship_no, tank_name },
  })

  return data
  */
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/flow/last-time`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      },
      params: {
        ship_no, tank_name
      },
    })    
  }    
}

export async function getFlowData(params, { signal } = {}) {
  /*
  const { data } = await axiosIns.get('/flow/data', {
    params,
    paramsSerializer: p => new URLSearchParams(p).toString(),
    signal,
  })
  
  return data
  */

  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/flow/data`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      },
      params,
      paramsSerializer: p => new URLSearchParams(p).toString(),
    })    
  }
  
  // Mock 데이터 반환 - type에 따라 다른 데이터 반환
  const shipNo = params?.shipNo || params?.ship_no
  const tankName = params?.tankName || params?.tank_name
  const type = params?.type // 'accumulated' 또는 'hourly'
  
  let mockData = type === 'accumulated' ? mockCumulativePours : mockHourlyPours
  
  // 선박과 탱크명으로 필터링
  if (shipNo && tankName) {
    mockData = mockData.filter(item => 
      item.ship_no === shipNo && item.tank_name === tankName
    )
  }
  
  return mockData
}

export async function getFlowStatus({ shipNo }) {
  /*
  const { data } = await axiosIns.get('/flow/status', { params: { shipNo } })
  return data
  */
 
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/flow/status`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      },
      params: {
        shipNo,
      },
    })    
  }
  
  // Mock 데이터 반환
  const filtered = mockFlows.filter(f => f.ship_no === shipNo)
  return filtered
}
