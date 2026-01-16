import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockTargetPours from './mock/targetPours.json'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 대상 주수높이 목록 조회 (원본 배열 반환) */
export async function getTargetPourListRaw({ ship_no, tank_name }) {

  /*
  const { data } = await axiosIns.get('/setting/target-pour/list', {
    params: { ship_no, tank_name },
  })
  // 백엔드 응답이 { data: [...] } 또는 [...] 둘 다 올 수 있어 방어
  return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
  */

  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/setting/target-pour/list`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
      },
      params: { ship_no, tank_name }
    })    
  }
  
  // Mock 데이터 필터링
  const filtered = mockTargetPours.filter(tp =>
    tp.ship_no === ship_no && tp.tank_name === tank_name
  )
  return filtered
}

/** 정규화된 높이 배열만 반환 (오름차순, 숫자만) */
export async function getTargetPourHeights({ ship_no, tank_name }) {
  const raw = await getTargetPourListRaw({ ship_no, tank_name })
  return raw
    .map(row => Number(row?.target_pour ?? row?.targetPour ?? row))
    .filter(v => Number.isFinite(v) && v > 0)
    .sort((a, b) => a - b)
}

export async function upsertTargetPour(payload) {
  /*
  const { data } = await axiosIns.post('/setting/target-pour/upsert', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data?.result === 'success' || data === 'success'
  */
  if(isUseAPI()) {
    const data = await request({
      url: `${contextPath}/setting/target-pour/upsert`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: payload
    })    
  }  
}
