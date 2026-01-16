import { defineStore } from 'pinia'
import { loginByPassword } from '../api/login'
import { getUserMenu, getMyMenus } from '../api/menu'
import { cloneDeep } from 'lodash-es'
import EventHandler from '@hiway/utils/eventHandler'

const resolveTreeMenu = (menuItem, targetMenuItem, tree) => {
  if ((menuItem.menulevel | 0) === 1) {
    tree.children.push(menuItem)
    
    return
  }

  if (menuItem['prnt_menu_id'] === targetMenuItem['menu_id']) {
    if (!targetMenuItem.children) targetMenuItem.children = []
    targetMenuItem.children.push(menuItem)
    
    return
  }
  if (targetMenuItem.children) {
    targetMenuItem.children.forEach(newTargetMenuItem => {
      resolveTreeMenu(menuItem, newTargetMenuItem, tree)
    })
  }
}

const setTreeMenu = menuData => {
  var tree = { children: [] }

  const showingMenuData = cloneDeep(menuData).filter(menu => {
    return menu.mnu_act !== 'H'
  })

  showingMenuData.sort((a, b) => {
    return a.prnt_menu_id.localeCompare(b.prnt_menu_id) || a.sort - b.sort
  })

  // showingMenuData.sort((a, b) => {
  //   if (a.sort > b.sort) return 1
  //   if (a.sort < b.sort) return -1
  //   else return 0
  // })  
  showingMenuData.forEach(menuItem => {
    resolveTreeMenu(menuItem, tree, tree)
  })

  return tree.children

}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [],
    myMenus: [],
  }),
  getters: {
    treeMenus(state) {
      return setTreeMenu(state.menus)
    },
    searchMenus() {
      const result = []
      
      function addMenus(menus) {
        menus.forEach(menu => {          
          if(!menu.children) {
            result.push(menu)
          } else {
            addMenus(menu.children)
          }
        })      
      }      

      addMenus(this.treeMenus)      
      
      return result      
    },
  },
  actions: {
    getMenus() {
      return new Promise((resolve, reject) => {
        // 초기화        
        getUserMenu()
          .then(response => {
            response.forEach(menu => {
              menu.title = menu.mnu_nm
              menu.prnt_menu_id = menu.prnts_menu_id
              menu.sort = menu.mnu_seq
              menu.path = menu.href
              menu.icon = menu.icon_path ? { icon: menu.icon_path }: null
            })
            this.menus = response                                  

            // FIXME: 현대중공업 현재 기준으로 하드 코드된 내역... 차후 수정 되어야 함.
            // 가져온 메뉴 값을 가지고 i18n에 값을 셋팅한다.

            // let ko = {}
            // let en = {}
            // response.forEach(menu => {
            //   ko[menu.menu_id] = menu.title
            //   en[menu.menu_id] = menu.title_eng ? menu.title_eng : menu.menu_id
            // })
            // i18n.mergeLocaleMessage('ko', ko)
            // i18n.mergeLocaleMessage('en', en)
            // 메뉴가 다 불러오면, 이를 사용하는 측에 이벤트를 발송한다.            
            EventHandler.emit('loaded-menu')
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getMyMenus() {            
      return new Promise((resolve, reject) => {
        getMyMenus().then(response => {
          this.myMenus = response
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })      
    },
    reset() {
      this.menus = []   
      this.myMenus = []   
    },
  },
})