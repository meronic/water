import { defineStore, storeToRefs } from 'pinia'
import { useMenuStore } from './menu'

export const useTagsStore = defineStore('tags', {
  state: () => ({
    visitedViews: [],
    cachedViews: [],
  }),
  getters: {},
  actions: {
    addVisitedView(view, t) {
      if(!view.name || (view.meta.noHistory || view.meta.redirectIfLoggedIn)) return
      for(let v of this.visitedViews) {
        if(v.name === view.name) {
          v = Object.assign(v, view)
          
          return 
        }
      }            

      // const { menus } = storeToRefs(useMenuStore())

      // const currentMenu = menus.value.find(menu => {
      //   return menu.href === view.path
      // })
      
      // let title = currentMenu ? currentMenu.menu_id : (view.name || 'no-name')
      
      // 다국어 로직 바꾸기
      this.visitedViews.push(
        Object.assign({}, view, {}),
      )
    },
    deleteVisitedView(view) {
      for (const [i, v] of this.visitedViews.entries()) {
        if (v.name === view.name) {
          this.visitedViews.splice(i, 1)
          break
        }
      }      
    },
    addCachedView(view) {
      if(!view.name || view.meta.noHistory ||view.meta.noCache || this.cachedViews.includes(view.name)) return
      this.cachedViews.push(view.name)
    },
    deleteCachedView(view) {
      for (const i of this.cachedViews) {
        if (i === view.name) {
          const index = this.cachedViews.indexOf(i)

          this.cachedViews.splice(index, 1)
          break
        }
      }
    },
    reset() {
      this.visitedViews = []
      this.cachedViews = []
    },
  },
})