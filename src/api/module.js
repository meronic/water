import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import mockModules from './mock/modules.json'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 장치 목록 조회 */
export async function getDevices() {
  /*
  const { data } = await axiosIns.get('/module/devices2')  

  // 그대로 넘겨도 되지만, 여기서 1차 매핑까지 해두면 컴포넌트가 가벼워짐
  return (data || []).map(d => ({
    idx: d.module_idx,
    name: d.module_name,
    uuid: d.device_uuid,
    ship: d.ship_no,
    tank: d.tank_name,
    branch: d.module_branch,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    del_flag: d.del_flag,
  }))  
  */

  
  if(isUseAPI()) {
    const rows =  await  request({
      url: `${contextPath}/module/devices`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
      },
    })  


    // 그대로 넘겨도 되지만, 여기서 1차 매핑까지 해두면 컴포넌트가 가벼워짐
    return (rows || []).map(d => ({
      idx: d.module_idx,
      name: d.module_name,
      uuid: d.device_uuid,
      ship: d.ship_no,
      tank: d.tank_name,
      branch: d.module_branch,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      del_flag: d.del_flag,
    }))
  }

  return (mockModules || []).map(d => ({
    idx: d.module_idx,
    name: d.module_name,
    uuid: d.device_uuid,
    ship: d.ship_no,
    tank: d.tank_name,
    branch: d.module_branch,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    del_flag: d.del_flag,
  }))  
    
  


}
export async function deleteModules(targets) {
  /*
  const { data } = await axiosIns.post('/module/delete', { targets })

  // 백엔드 응답 형태 통일 처리
  return data?.result === 'success' || data?.success === true || data === 'success'
  */

  if(isUseAPI()) {
    return request({
      url: `${contextPath}/module/delete`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data:  { targets } 
    })    
  }
  return data?.result === 'success' || data?.success === true || data === 'success'
}

export async function deactivateModules(targets) {
  /*
  const { data } = await axiosIns.post('/module/deactivate', { targets })
  return data?.result === 'success' || data?.success === true || data === 'success'
  */
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/module/deactivate`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: { targets } 
    })    
  }
  return data?.result === 'success' || data?.success === true || data === 'success' 
}


export async function activateModules(targets) {
  
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/module/activate`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: { targets } 
    })    
  }
}

export async function getModuleList() {
/*  const { data } = await axiosIns.get('/module/list')
  return Array.isArray(data) ? data : []*/
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/module/list`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
      },
    })    
  }
  
  return mockModules || []
}

/** ✅ 모듈 등록 */
export async function insertModule(payload) {
  /*
  const { data } = await axiosIns.post('/module/insert', payload)
  return data?.result === 'success' || data === 'success'
  */
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/module/insert`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: payload
    })    
  }
  return data?.result === 'success' || data === 'success'

}

/** ✅ 모듈 수정 */
export async function updateModule(payload) {
  /*
  const { data } = await axiosIns.post('/module/update', payload)
  return data?.result === 'success' || data === 'success'
  */
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/module/update`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: payload
    })    
  }
  return data?.result === 'success' || data === 'success' 
}

export async function getActiveModulesByShip() {
  const data = await getModuleList()
  const next = {}

  data.forEach(m => {
    const del = Number(m.del_flag ?? m.delFlag ?? 2)
    if (del !== 0) return

    const ship = m.ship_no ?? m.shipNo
    const tank = m.tank_name ?? m.tankName
    if (!ship || !tank) return

    if (!next[ship]) next[ship] = new Set()
    next[ship].add(String(tank))
  })

  return next
}
