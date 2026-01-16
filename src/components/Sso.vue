

<script setup>
import { setToken } from '@hiway/utils/token'
import { useUserStore } from '@hiway/stores/user'
import { useMenuStore } from '@hiway/stores/menu'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const menuStore = useMenuStore()

const tokenCheck = () => {
  const ssoToken = router.currentRoute.value.redirectedFrom.query.token

  console.log('ssoToken : ' + ssoToken)
  if (!ssoToken) {
    router.replace('/login')
    return false
  }
  setToken(ssoToken)
  return true
}

if (tokenCheck()) {
  const return_url = router?.currentRoute?.value?.redirectedFrom?.query?.return_url
  const param = router?.currentRoute?.value?.redirectedFrom?.query?.param

  // 새로 화면이 불러오면 user Info 정보를 가져온다.
  // (토큰 값이 있어도 조회가 안될 수 있는 경우) request 상위에서 에러가 발생하면 무시된다.
  userStore.setUserInfo().then(() => {
    menuStore.getMenus()
    menuStore.getMyMenus()

    /*
      if (route.query.return_url) {
        router.replace(route.query.return_url)
        route.query.return_url = null
      } else {
        router.push('/')
      }
      */
    if (return_url) {
      if (param) {
        router.replace(return_url + '?param=' +param)
      } else {
        router.replace(return_url)
      }
    } else {
      router.push('/')
    }
  })
}
</script>