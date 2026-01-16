import { useLogsStore } from "@hiway/stores/logs"
import { useUserStore } from "@hiway/stores/user"
import { find } from "lodash-es"
import EventHandler from "@hiway/utils/eventHandler"

export default {  
  // called when the bound element's parent component
  // and all its children are mounted.
  mounted(el, binding, vnode, prevVnode) 
  {    
    EventHandler.once(function() {
      const logsStore = useLogsStore()    
      const userStore = useUserStore()
      const { value } = binding            

      const target = find(userStore.buttonPermission, {
        menu_id: logsStore.menuId,
      })

      const permissions = target ? target.actions : []      

      if(value && value instanceof Array && value.length > 0) {
        if(permissions.some(role => value.includes(role))) {
          el.hidden = false
        } else {
          el.hidden = true
        }
      } else {        
        if(value instanceof Array) return
        throw new Error(
          '버튼 퍼미션 설정이 필요합니다. ! ex: v-permission="[\'btnUpdate\',\'btnDelete\']"',
        )
      }
      
    }, 'loaded-menu', 'loaded-permission')
  },
}

