import { defineStore } from 'pinia'
import { themeConfig } from '@themeConfig'

export const useCommonStore = defineStore('common', {
  state: () => ({
    loading: false,
    isFullScreen: false,
    systemCode: themeConfig.app.systemCode,
  }),
  getters: {},
  actions: {
    addFullScreenListener() {
      document.addEventListener('fullscreenchange', () => {
        if(!document.fullscreenElement) {        
          this.isFullScreen = false
                
        }
      })
    },
  },
})