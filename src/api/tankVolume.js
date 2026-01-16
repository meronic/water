import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockTankVolumes from './mock/tankVolumes.json'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 탱크 볼륨 조회 */
export async function findTankVolume({ ship_no, tank_name }) {
  /*
  const { data } = await axiosIns.get('/tank-volume/find', { params: { ship_no, tank_name } })
  // 백엔드가 { data: [...] } 형태를 준다고 가정
  return Array.isArray(data?.data) ? data.data : []
  */
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
  
  // Mock 데이터 필터링
  const filtered = mockTankVolumes.filter(tv => 
    tv.ship_no === ship_no && tv.tank_name === tank_name
  )
  return filtered
}

/** 해당 탱크에 볼륨 등록 여부 편의 함수 */
export async function hasTankVolume({ ship_no, tank_name }) {
  const rows = await findTankVolume({ ship_no, tank_name })
  return rows.length > 0
}

export function saveTankVolumes(rows) {
  /*
  const { data } = await axiosIns.post('/tank-volume/save', rows)
  return data?.result === 'success' || data === 'success'
  */
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
}

export async function estimateTankHeight({ ship_no, tank_name, current_volume }) {
  /*
  const { data } = await axiosIns.get('/tank-volume/estimate', {
    params: { ship_no, tank_name, current_volume },
  })
  return data
  */
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
  
  // Mock 데이터 반환 - 탱크 높이 추정
  const tank = mockTankVolumes.find(tv => tv.ship_no === ship_no && tv.tank_name === tank_name)
  if (!tank) return { currentheight: 0 }
  
  // volume을 depth로 변환 (volume = length * width * height)
  const estimatedHeight = (Number(current_volume) / (tank.length * tank.width)) || 0
  return {
    currentheight: Number(estimatedHeight.toFixed(2)),
    volume: current_volume,
  }
}

/** ✅ 탱크 최대 수위 조회 */
export async function getTankMaxHeight({ ship_no, tank_name }) {
  /*
  const { data } = await axiosIns.get('/tank-volume/max', {
    params: { ship_no, tank_name },
  })
  return data
  */
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
  
  // Mock 데이터 반환 - 탱크 최대 높이
  const tank = mockTankVolumes.find(tv => tv.ship_no === ship_no && tv.tank_name === tank_name)
  if (!tank) return { maxheight: 0 }
  
  return {
    maxheight: tank.depth || 15,
    volume: tank.total_volume,
  }
}
