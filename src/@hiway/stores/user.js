import { defineStore } from 'pinia'
import { getUserInfoBySession, loginByPassword, logout } from '../api/login'
import { getButtonPermission } from '../api/user'
import { useMenuStore } from './menu'
import { useTagsStore } from './tags'
import { removeToken } from '../utils/token'
import router from '@/router'
import EventHandler from '@hiway/utils/eventHandler'
import { isTouchOneLogin } from '@hiway/utils/check'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: '',
    userName: '',
    buttonPermission: [],
  }),
  getters: {},
  actions: {
    loginByPassword(user_id, password) { 
      return new Promise((resolve, reject) => {
        loginByPassword(user_id,password).then(res => {          
          resolve()
        })
          .catch(error => {
            reject(error)
          })
      })
    },
    setUserInfo() {
      return new Promise((resolve, reject) => {
        getUserInfoBySession().then(res => {
          // 받아오는 값이 Array일 경우
          res = Array.isArray(res) ? res[0] : res
          this.userId = res.user_id
          this.userName = res.kor_nm

          getButtonPermission().then(btnRes => {
            if(!Array.isArray(btnRes)) btnRes = []
            this.buttonPermission = btnRes
            EventHandler.emit('loaded-permission')
            resolve()
          })          
        }).catch(error => {
          reject(error)
        })
            
      })
    },
    reset() {
      this.userId = '',
      this.userName = '',
      this.buttonPermission = []
    },
    logout() {
      logout().then(() => {
        this.clear()
        // SmartOne
        if (isTouchOneLogin()) {
          touchOneObj.executeExitWebBrowser()
        }
      })      
    },
    clear() {
      useMenuStore().reset()
      useTagsStore().reset()
      this.reset()
      removeToken()
      router.push('/login')      
    },      
  },
})