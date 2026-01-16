import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 알림 대상자 등록 */
export async function insertAlarmUser(workerNo) {
  /*
  const { data } = await axiosIns.post('/alarm-user/insert', { worker_no: workerNo })
  return data === 'success' || data?.success === true
  */
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/alarm-user/insert`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data : { worker_no: workerNo }
    })    
  }  
}

/** 알림 대상자 목록 */
export async function getAlarmUserList() {
  /*
  const { data } = await axiosIns.get('/alarm-user/list')
  return (data || []).map(d => ({
    idx: d.idx,
    workerNo: d.worker_no,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }))
  */
  if(isUseAPI()) {
    const data = await request({
      url: `${contextPath}/alarm-user/list`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
      },
    })    

    return (data || []).map(d => ({
      idx: d.idx,
      workerNo: d.worker_no,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }))    
  }   
}

/** 알림 대상자 삭제 (옵션) */
export async function removeAlarmUser(idx) {
  /*
  const { data } = await axiosIns.delete(`/alarm-user/${idx}`)
  return data === 'success' || data?.success === true
  */
  if(isUseAPI()) {
    const data = await request({
      url: `${contextPath}/alarm-user/${idx}`,
      method:'delete',
      meta: {
        apiVersion: '2.0.0',
      },
    })    

  }
}

export async function sendTestAlert({ title, msg, shipNo, tankName }) {
  /*
  const { data } = await axiosIns.post('/alarm-user/send-alert', {
    title,
    msg,
    shipNo,
    tankName,
  })
  
  return data === 'success' || data?.success === true
  */
  if(isUseAPI()) {
    request({
      url: `${contextPath}/alarm-user/send-alert`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data : { title, msg, shipNo, tankName }
    })    
  }   
}