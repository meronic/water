<script setup>
import tree from '@images/pages/tree.png'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/img_ship1.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/auth-v2-mask-dark.png'
import authV2MaskLight from '@images/pages/auth-v2-mask-light.png'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { themeConfig } from '@themeConfig'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@hiway/stores/user'
import { useMenuStore } from '@hiway/stores/menu'
import { required, passwordValidator, confirmedValidator } from '@hiway/utils/validation'
import notify from '@hiway/utils/notify'
import { resetPassword } from '@hiway/api/user'

// image
// const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
// const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const menuStore = useMenuStore()

const loginForm = ref({
  user_id: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)
const errorMessages = ref([])
const refLoginVForm = ref()

const signIn = () => {
  refLoginVForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) {
      userStore.loginByPassword(loginForm.value.user_id, loginForm.value.password).then(() => {    
        userStore.setUserInfo().then(() => {
          menuStore.getMenus()
          menuStore.getMyMenus()
          router.push('/')
        })
      }).catch(e => {    
        console.error('login fail', e)

        switch(e.response.data.result.code) {
        case '40000413':
          alert(t('msg.first-login'))
          resetPasswordModalVisible.value = true
          break
        case '40000414':
          alert(t('3month-change-password'))
          resetPasswordModalVisible.value = true
          break
        case '40000115':
          break
        case '40300416':          
          break
        default:
          errorMessages.value = [t('xbuilder.msg.error-login')]
        }
      })
    }
  })
}

// 비밀번호 초기화
// modal value
const resetPasswordModalVisible = ref(false)

// template ref
const refResetPasswordVForm = ref()

// from data
const resetPasswordForm = ref({
  password: '',
  confirmPassword: '',
})

const fnResetPassword = () => {
  refResetPasswordVForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) {
      const params = {
        user_id: loginForm.value.user_id,
        password: resetPasswordForm.value.password,
      }

      resetPassword(params).then(() => {
        notify.info(t('xbuilder.msg.complete-password'))
        resetPasswordModalVisible.value=false
      })
    }
  }) 
}

// clear form
watch(() => resetPasswordModalVisible.value, newValue => {
  if(newValue) return
  refResetPasswordVForm.value?.reset()  
})
</script>

<template>
  <div>
    <!-- Title and Logo -->
    <div class="auth-logo d-flex align-start gap-x-3">
      <!-- <VNodeRenderer :nodes="themeConfig.app.logo" /> -->
      <img :src="themeConfig.app.logo">

      <h1 class="font-weight-medium leading-normal text-2xl">
        {{ themeConfig.app.title }}
      </h1>
    </div>

    
    <VRow
      no-gutters
      class="auth-wrapper full-bg"
    >
    <VCol
        md="8"
        class="d-none d-md-flex align-center justify-center position-relative bg-col"
      >
        <VImg :src="authThemeImg" class="bg-img" />
      </VCol>

      <VCol
        cols="12"
        md="4"
        class="auth-card-v2 d-flex align-center justify-center"
      >
        <VCard
          flat
          :max-width="500"
          class="mt-12 mt-sm-0 pa-4"
        >
          <VCardText>
            <h5 class="text-h5 font-weight-medium mb-1">
              주수 모니터링 시스템
            </h5>
          </VCardText>
          <VCardText>
            <VForm
              ref="refLoginVForm"
              @submit.prevent="signIn"
            >
              <VRow>
                <!-- email -->
                <VCol cols="12">
                  <VTextField
                    v-model="loginForm.user_id"
                    :label="$t('xbuilder.id')"
                    type="text"
                    :rules="[required($t('xbuilder.msg.required-id'))]"
                    density="compact"                    
                  />
                </VCol>

                <!-- password -->
                <VCol cols="12">
                  <VTextField
                    v-model="loginForm.password"
                    :label="$t('xbuilder.password')"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    :rules="[required($t('xbuilder.msg.required-password'))]"                  
                    density="compact"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"                    
                  />
                  <p
                    v-for="(message, index) of errorMessages"
                    :key="index"
                    class="mt-2 text-error"
                  >
                    {{ message }}
                  </p>

                  <div class="d-flex align-center flex-wrap justify-end mt-1 mb-4">                    
                    <routerLink
                      class="text-primary ms-2 mb-1"
                      to="/forgot-password"
                    >
                      Forgot Password?
                    </routerLink>
                  </div>

                  <VBtn
                    block
                    type="submit"
                  >
                    Login
                  </VBtn>                  
                </VCol>

                <!-- create account -->
                <VCol
                  cols="12"
                  class="text-center text-base"
                >
                  <span>New on our platform?</span>
                  <routerLink
                    class="text-primary ms-2"
                    to="/register"
                  >
                    Create an account
                  </routerLink>
                </VCol>                                
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
  <VDialog
    v-model:model-value="resetPasswordModalVisible"
    width="390"
    persistent
  >
    <VCard>
      <VToolbar
        color="primary"
        dark
      >
        <VToolbarTitle>
          {{ $t('xbuilder.Reset Password') }}
        </VToolbarTitle>
        <VSpacer />
        <VBtn
          icon="mdi-close"          
          color="default"
          @click="resetPasswordModalVisible = false"
        />
      </VToolbar>
      <VForm
        ref="refResetPasswordVForm"
        @submit.prevent="fnResetPassword"
      >           
        <VCardText>        
          <VTextField
            v-model="resetPasswordForm.password"
            :label="$t('xbuilder.password')"
            type="password"
            :rules="[passwordValidator]"
          />
          <VTextField
            v-model="resetPasswordForm.confirmPassword"
            :label="$t('xbuilder.Confirm password')"
            type="password"
            class="mt-2"
            :rules="[confirmedValidator(resetPasswordForm.password, resetPasswordForm.confirmPassword)]"
          />
        </VCardText>
        <VDivider />
        <VCardActions class="py-2 justify-end">
          <VBtn 
            color="primary"
            variant="elevated"
            type="submit"
          >
            {{ $t('xbuilder.Save') }}
          </VBtn>
        </VCardActions>
      </VForm>        
    </VCard>
  </VDialog>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
.full-bg {
  height: 100vh;
  overflow: hidden;
}

.bg-col {
  padding: 0;
}

.bg-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>

<route lang="yaml">
meta:
  layout: blank
  redirectIfLoggedIn: true
</route>
