import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 탱크 볼륨 조회 */
export async function findTankVolume({ ship_no, tank_name }) {
  if(isUseAPI()) {
    const data = await request({
      url: `${contextPath}/tank-volume/find`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
      },
      params : { ship_no, tank_name }
    })    

    return data.data
  }
  
  // 🔧 Mock 데이터
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([])
    }, 300)
  })
}

/** 해당 탱크에 볼륨 등록 여부 편의 함수 */
export async function hasTankVolume({ ship_no, tank_name }) {
  const rows = await findTankVolume({ ship_no, tank_name })
  return rows.length > 0
}

export function saveTankVolumes(rows) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/tank-volume/save`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data : rows
    })

  }
  
  // 🔧 Mock 응답
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 300)
  })
}

export async function estimateTankHeight({ ship_no, tank_name, current_volume }) {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/tank-volume/estimate`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
      },
      params : { ship_no, tank_name, current_volume },
    })    
  }
  
  // 🔧 Mock: 부피에서 높이 추정 (정사각형 10x10m 가정)
  return new Promise((resolve) => {
    setTimeout(() => {
      const height = current_volume / 100
      resolve(height)
    }, 300)
  })
}

/** ✅ 탱크 최대 수위 조회 */
export async function getTankMaxHeight({ ship_no, tank_name }) {
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/tank-volume/max`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
      },
      params : { ship_no, tank_name},
    })    
  }    
}
