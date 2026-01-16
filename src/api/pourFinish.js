import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 주수완료 설정 조회 (정규화해서 반환) */
export async function readPourFinish({ ship_no, tank_name }) {
  /*
  const { data } = await axiosIns.get('/setting/pour-finish/read', {
    params: { ship_no, tank_name },
  })
  const raw = data?.data ?? data ?? {}

  // 스네이크/카멜 혼용 방어
  const completionMinutes = raw.completion_minutes ?? raw.completionMinutes ?? null
  const repetitionsNumber = raw.repetitions_number ?? raw.repetitionsNumber ?? null

  return {
    completionMinutes,
    repetitionsNumber,
  }

  */
  if(isUseAPI()) {
    const raw = await request({
      url: `${contextPath}/setting/pour-finish/read`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
      },
      params: { ship_no, tank_name }
    })    

    // 스네이크/카멜 혼용 방어
    const completionMinutes = raw.completion_minutes ?? raw.completionMinutes ?? null
    const repetitionsNumber = raw.repetitions_number ?? raw.repetitionsNumber ?? null

    return {
      completionMinutes,
      repetitionsNumber,
    }    
  }  
}

export async function savePourFinish(payload) {
  /*
  const { data } = await axiosIns.post('/setting/pour-finish/save2', payload, {
    headers: { 'Content-Type': 'application/json' },
  })

  return data?.result === 'success' || data === 'success'
  */
 
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/setting/pour-finish/save`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: payload 
    })   
  } 
  
}
