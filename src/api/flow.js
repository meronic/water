import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockFlowData from './mock/flowData.json'
import mockGraphData from './mock/graphData.json'
import mockHourlyData from './mock/hourlyData.json'

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
  
  // 🔧 Mock 데이터 - 시간별 그래프용 (시간별 주수량)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockHourlyData)
    }, 300)
  })
}

export async function getFlowLastTime({ ship_no, tank_name }) {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/flow/last-time`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      },
      params: { ship_no, tank_name },
    })    
  }
  
  // 🔧 Mock 데이터
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { device_idx: 1, device_name: "유량계_A", receive: "수신", lastTime: "10:30:42", status: "normal" },
        { device_idx: 2, device_name: "유량계_B", receive: "수신", lastTime: "10:30:43", status: "normal" }
      ])
    }, 300)
  })
}

export async function getFlowData(params, { signal } = {}) {
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
  
  // 🔧 Mock 데이터 - 누적 그래프용 (누적 주수량)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockGraphData)
    }, 300)
  })
}

export async function getFlowStatus({ shipNo }) {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/flow/status`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false
      },
      params: { shipNo },
    })    
  }
  
  // 🔧 Mock 데이터 - 배열로 반환 (shipStore.syncLatestTankDataFromApi에서 .forEach 호출 예상)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          tank_name: "탱크_1",
          tankName: "탱크_1",
          ship_no: shipNo,
          current_height: 1.45,
          max_height: 2.5,
          currentAccumulation: 21.02,
          accumulationSetting: 25,
          goal: 25,
          actual: 21.02,
          flowRate: 4.2,
          flow_rate: 4.2,
          unit: "㎥",
          status: "normal",
          timestamp: new Date().toISOString(),
          time: new Date().toISOString()
        }
      ])
    }, 300)
  })
}
