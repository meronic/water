import axios from 'axios'
import request from '@/utils/request'
import { themeConfig } from '@themeConfig'
import { isUseAPI } from '@hiway/utils/check'
import menus from './mock/menus.json'
import myMenus from './mock/myMenus.json'

const contextPath = import.meta.env.VITE_HIWAY_API_URL

const systemCode = themeConfig.app.systemCode

export function getUserMenu() {
  // local 개발 환경이 아닐 경우, 무조건 서버를 조회해야 함
  const params = {
    device: 'P',
  }

  if(isUseAPI()) {
    return request({
      url: `${contextPath}/menus`,
      method: 'get',
      params,
      meta: { apiVersion: '2.1.0' },
    })  
  }  

  return new Promise(resolve => {
    resolve(menus)
  })
}

export function getMyMenus() {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/mymenus/apps/${systemCode}`,
      method: 'get',
      meta: { apiVersion: '2.1.0' },
    })    
  }

  return new Promise(resolve => {
    resolve(myMenus)    
  })
}

export function addMyMenus(data) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/mymenus/apps/${systemCode}`,
      method: 'post',
      data,
    })
  }    
}

export function updateMyMenus(data) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/mymenus/apps/${systemCode}`,
      method: 'put',
      data,
    })    
  }  
}

export function deleteMyMenus(data) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/mymenus/apps/${systemCode}`,
      method: 'delete',
      data,
    })    
  }  
}

export function saveMyMenu(gridSaveDatas) {
  if(isUseAPI()) {
    // local 개발 환경이 아닐 경우, 무조건 서버를 조회해야 함
    const saveActions = []

    // 한번에 보내서 처리하기 위해 필요한 정보들을 형식에 맞게 담아준다.
    const createdAction = function (rowDatas) {
    // row 값을 보내 추가 처리
      return request({
        url: `${contextPath}/mymenus/apps/${systemCode}`,
        method: 'post',
        data: rowDatas,
      })
    }

    const updatedAction = function (rowDatas) {
    // row 값을 보내 추가 처리
      return request({
        url: `${contextPath}/mymenus/apps/${systemCode}`,
        method: 'put',
        data: rowDatas,
      })
    }

    // 한번에 보내서 처리하기 위해 필요한 정보들을 형식에 맞게 담아준다.
    const deletedAction = function (rowDatas) {
    // row 값을 보내 삭제 처리
      return request({
        url: `${contextPath}/mymenus/apps/${systemCode}`,
        method: 'delete',
        data: rowDatas,
      })
    }

    // created 에 담긴 데이터가 있으면, request post 틀에 맞춰 만들어준다
    // 전체 데이터를 배열로 담아 넘긴다
    if (gridSaveDatas.created && gridSaveDatas.created.length > 0) {
      saveActions.push(createdAction(gridSaveDatas.created))
    }

    // updated 에 담긴 데이터가 있으면, request put 틀에 맞춰 만들어준다
    // 전체 데이터를 배열로 담아 넘긴다
    if (gridSaveDatas.updated && gridSaveDatas.updated.length > 0) {
      saveActions.push(updatedAction(gridSaveDatas.updated))
    }

    // deleted 에 담긴 데이터가 있으면, request delete 틀에 맞춰 만들어준다
    // 전체 데이터를 배열로 담아 넘긴다
    if (gridSaveDatas.deleted && gridSaveDatas.deleted.length > 0) {
      saveActions.push(deletedAction(gridSaveDatas.deleted))
    }

    // 차후 변경될 Restful 형식에 따라 수정해야 함
    // axios.all 을 사용하면 post, delete, put을 한꺼번에 처리 가능하다.
    // 하나하나씩 따로 보내서 처리할경우 리턴 값을 각각 받아야해서 한번에 보내 처리한다.
    return (
      axios
        .all(saveActions)

      // saveActions에 담긴 요청이 전부 성공하면 200 을 던져준다
        .then(() => '200')
        .catch(error => error)
    )
  }
}