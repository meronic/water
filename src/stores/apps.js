import { defineStore } from 'pinia'

export const useAppsStore = defineStore('apps', {
  state: () => ({    
    isCustomizerOpen: false,

  }),
  actions: {
    toggleCustomizer(value) {
      this.isCustomizerOpen = value
    },        
  },
})