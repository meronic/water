import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'

const contextPath = import.meta.env.VITE_API_BASE_URL

export async function getWebSettings() {
  /*
  const { data } = await axiosIns.get('/setting/read2')
  
  return data
  */
  
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/setting/read`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress : false, // Dashboard에서는 Setting이 너무 자주 호출되어서, 일단 loading이 안보이도록 false처리
      },
    })    
  }
  
  // Mock 데이터 반환 - 설정값
  return {
    data: [
      { key: 'noReceiptSec', value: 180 }
    ]
  }
}

export async function saveWebSettings(payload) {
  /*
  const { data } = await axiosIns.post('/setting/value', payload)
  return data?.success === true || data === 'success'
  */
  
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/setting/value`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: payload
    })    
  }   
  
}
