import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'

const contextPath = import.meta.env.VITE_API_BASE_URL

/** 사용자 목록 조회 */
export async function getUserList() {
  /*
  const { data } = await axiosIns.get('/user/list')

  // 백엔드 VO: user_idx, user_name, createdAt, updatedAt
  // 25.12.11 mapper와 vo를 수정해서, 여기서는 map 하지 않도록 변경. map하려면 await를 추가해야함... 
  // return (data || []).map(d => ({
  //   idx: d.user_idx,
  //   name: d.user_name,
  //   createdAt: d.createdAt,
  //   updatedAt: d.updatedAt,
  // }))
  

  return data
  */
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/user/list`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
      },
    })    
  }  
}
export async function insertUser(userName) {
  /*
  const { data } = await axiosIns.post('/user/insert', { user_name: userName })
  // 백엔드가 문자열 또는 객체로 응답하므로 통일된 true/false 반환
  return data === 'success' || data?.success === true
  */
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/user/insert`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: { user_name : userName }
    })    
  }   
}

export async function removeUser(idx) {
  /*
  const { data } = await axiosIns.delete(`/user/${idx}`)
  return data === 'success' || data?.success === true
  */
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/user/${idx}`,
      method:'delete',
      meta: {
        apiVersion: '2.0.0',
      },
    })    
  }    
}
