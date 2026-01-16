import request from '@/utils/request'
import { isUseAPI } from '@hiway/utils/check'
import loginUser from './mock/loginUser.json'
import { setToken, getToken } from '@hiway/utils/token'

const contextPath = import.meta.env.VITE_HIWAY_API_URL

export function loginByPassword(user_id, password) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/login`,
      method:'post',
      data: {
        user_id,
        password,
      },
      meta: {
        apiVersion: '2.0.0',
        useTokenUpdate: true,
        useErrorMessage: false,
      },
    })    
  }

  return new Promise((resolve, reject) => {
    const res = loginUser[user_id]
    if (res) {
      resolve(res)          
      setToken(user_id)  
    } else {
      const error = { response: { data: { result: { code: '40000111' } } } }

      reject(error)
    }
  })
}

export function getUserInfoBySession() {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/login/user`,
      meta: { apiVersion: '2.0.0' },
      method: 'get',
    })
  }  

  return new Promise((resolve, reject) => {
    const userId = getToken()
    const res = loginUser[userId]

    if(res) {
      resolve(res)
    } else {
      const error = { code: '401' }

      reject(error)
    }
  })
}

export function getPassCertWithId(user_id) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/login/auth/phone`,
      params: {
        user_id,
      },
      meta: {
        apiVersion: '2.1.0',
        useTokenUpdate: true,
        useErrorMessage: false,
      },
      method: 'get',
    })
  }
  
  return new Promise(resolve => {
    resolve()
  })
}

export function certificate(authNumber) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/login/auth/confirm`,
      params: {
        authNumber,
      },
      meta: {
        useErrorMessage: false,
        apiVersion: '2.1.0',      
        useAuth: false,
      },
      method: 'get',
    })
  }
  
  return new Promise((resolve, reject) => {
    if(authNumber === 123456) {
      resolve()
    } else {
      reject()
    }

  })
}

export function getPassCertWithPhone(name, fromPhone, phone) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/login/auth/phone`,
      params: {
        name,
        fromPhone: phone,
        phone,
      },
      meta: {
        apiVersion: '2.0.0',
        useTokenUpdate: true,      
      },
      method:'get',    
  
    })
  }  
  
  return new Promise(resolve => {
    resolve()
  })
}

export function certificate2(authNumber) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/login/auth/confirm`,
      params: {
        authNumber,
      },
      meta: {
        apiVersion: '2.0.0',      
      },
      method: 'get',
    })
  }

  return new Promise((resolve, reject) => {
    if(authNumber === 123456) {
      resolve()
    } else {
      reject()
    }

  })
}

export function duplicateCheck(userId) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/login/users/${userId}`,
      method: 'get',
    })
  }

  return new Promise(resolve => {
    resolve()
  })

}

export function joinUsers(params) {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/login/users`,
      method: 'post',
      data:[params],
    })
  }  
  
  return new Promise(resolve => {
    resolve()
  })
}

export function logout() {
  if(isUseAPI()) {
    return request({
      url: `${contextPath}/login/logout`,
      meta: {
        apiVersion: '2.0.0',
      },
      method: 'get',
    })    
  }

  return new Promise(resolve => {
    resolve()
  })
}

export function touchOneLoginSso(userId) {
  if (isUseAPI()) {
    // 차후 변경될 Restful 형식에 따라 수정해야 함
    return request({
      url: `${contextPath}/login/token`,
      meta: {
        apiVersion: '2.0.0',
        useTokenUpdate: true,
        useResponseAll: true,
        useErrorMessage: false
      },
      method: 'post',
      data: {
        user_id: userId
      }
    })
  }

  return new Promise(resolve => {
    resolve()
  })
}