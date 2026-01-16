import axiosIns from '@/lib/http'
import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'

const contextPath = import.meta.env.VITE_API_BASE_URL

export async function getMjpegUrl(camIdx) {
  //로컬
  // const url = `/api/camera/mjpeg?camIdx=${camIdx}`
  //배포
  /*
  const url = `/tankmonitoring/camera/mjpeg?camIdx=${camIdx}`

  return {
    ok: true,
    url,
  }
  */
  if(isUseAPI()) {
    const data = await request({
      url: `${contextPath}/camera/mjpegurl`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress: false,
      },
      params : { camIdx },
    })    

    const url = contextPath + data.url
    return {
      ok: true,
      url,
    }    
  }   
}

// export async function getActiveStream(camIdx) {
//   const { data } = await axiosIns.get('/camera/stream/active', { params: { camIdx } })
//   return data
// }

export async function stopCamera(camIdx) {
  /*
  const { data } = await axiosIns.post('/camera/stop', { camIdx }) // JSON
  return data
  */
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/camera/stop`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
        useProgress: false,
      },
      params : { camIdx }
    })    
  }  
}

export async function getCameraConfig() {
/*  
  const { data } = await axiosIns.get('/camera/config')
  return data
*/
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/camera/config`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress: false,
      },
    })    
  }  
}

export async function saveCameraConfig(payload) {
  /*
  const { data } = await axiosIns.post('/camera/config/save', payload)
  return (
    data === 'OK' ||                    // 백엔드 현재 응답
    data === 'success' ||               // 혹시 나중에 바뀔 수도 있으니
    data?.result === 'success' ||       // JSON 형태일 때 대비
    data?.success === true              // { success: true } 형태 대비
  )
  */
  if(isUseAPI()) {
    await request({
      url: `${contextPath}/camera/config/save`,
      method:'post',
      meta: {
        apiVersion: '2.0.0',
      },
      data: payload
    })    

  }   
}

export async function getStreamActive(camIdx) {
 /* 
  const { data } = await axiosIns.get('/camera/stream/active2', { params: { camIdx } })
  return data
  */
 
  if(isUseAPI()) {
    return await request({
      url: `${contextPath}/camera/stream/active`,
      method:'get',
      meta: {
        apiVersion: '2.0.0',
        useProgress: false,
      },
      params : { camIdx }
    })    
  }   

}