import { defineStore } from 'pinia'
import { saveExecuteMenu } from '../api/user'
import { getToken } from '../utils/token'
import { useMenuStore } from './menu'
import { useTagsStore } from './tags'
import { getAgentType } from '@hiway/utils/check'

export const useLogsStore = defineStore('logs', {
  state: () => ({
    path: '',
    name: '',
    fullPath: '',    
    menuId: '',
    agentType: getAgentType(),
  }),
  getters: {},
  actions: {
    setCurrentRoute(to) {
      const menuStore = useMenuStore()
      const tagsSotre = useTagsStore()

      this.path = to.path
      this.name = to.name
      this.fullPath = to.fullPath

      const currentMenu = menuStore.menus.find(menu => menu.href === to.path) || { menu_id: to.name }

      this.menuId = currentMenu?currentMenu.menu_id:to.name      

      if(getToken() && !tagsSotre.visitedViews.some(tag => { return tag.path === to.path})) saveExecuteMenu(currentMenu.menu_id)                            
        
    },
    
  },
})