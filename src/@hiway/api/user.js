import request from '@/utils/request'
import { themeConfig } from '@themeConfig'
import { isUseAPI } from '@hiway/utils/check'
import buttonPermission from './mock/buttonPermission.json'

const contextPath = import.meta.env.VITE_HIWAY_API_URL
const app_id = themeConfig.app.systemCode

export function saveExecuteMenu(menu_id) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/log/menu`,
      data: {
        menu_id,
      },
      meta: { apiVersion: '2.0.0' },
      method: 'post',
    })  
  }
}

export function getButtonPermission() {
  if(isUseAPI()) {
    return request({
      url:`${contextPath}/authusers/apps/${app_id}/button`,
      method: 'get',
      meta: { apiVersion: '2.0.0' },
    })    
  }
  
  return new Promise(resolve => {
    resolve(buttonPermission)
  })
}

export function resetPassword(data) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/users/setpassword`,
      method: 'put',
      data,
      meta: { apiVersion: '2.0.0' },
    })
  }    
}

export function initPassword() {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/users/initpassword`,
      meta: {
        apiVersion: '2.0.0',
      },
      method:'put',
    })
  }  
}

export function changePassword(retrieveObj) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/users/password`,
      method: 'put',
      data: retrieveObj,
      meta: { apiVersion: '2.0.0' },
    })
  }  
}