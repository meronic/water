import permission from './permission'

const Directives = {
  install(Vue) {
    Vue.directive('permission', permission)
  },
}

export default Directives
