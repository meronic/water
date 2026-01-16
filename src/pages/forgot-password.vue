<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import tree from '@images/pages/tree.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import authV2ForgotPasswordIllustrationBorderedDark from '@images/pages/auth-v2-forgot-password-illustration-bordered-dark.png'
import authV2ForgotPasswordIllustrationBorderedLight from '@images/pages/auth-v2-forgot-password-illustration-bordered-light.png'
import authV2ForgotPasswordIllustrationDark from '@images/pages/auth-v2-forgot-password-illustration-dark.png'
import authV2ForgotPasswordIllustrationLight from '@images/pages/auth-v2-forgot-password-illustration-light.png'
import authV2MaskDark from '@images/pages/auth-v2-mask-dark.png'
import authV2MaskLight from '@images/pages/auth-v2-mask-light.png'
import { getPassCertWithId, certificate } from '@hiway/api/login'
import { initPassword } from '@hiway/api/user'
import notify from '@hiway/utils/notify'
import { useRouter } from 'vue-router'
import { onBeforeUnmount, getCurrentInstance } from 'vue'
import { removeToken, setIsBeforeRemoveToken } from '@hiway/utils/token'
import { required } from '@hiway/utils/validation'
import { useI18n } from 'vue-i18n'


const vm = getCurrentInstance().proxy
const { t } = useI18n()
const userId = ref('')
const certificationNumber = ref('')
const authThemeImg = useGenerateImageVariant(authV2ForgotPasswordIllustrationLight, authV2ForgotPasswordIllustrationDark, authV2ForgotPasswordIllustrationBorderedLight, authV2ForgotPasswordIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const message = ref(t('xbuilder.view-forgot-password.message1'))
const tab = ref(1)
const refIdForm = ref()
const refCertiForm = ref()
const router = useRouter()

const goToLogin = () => {
  removeToken()
  router.push('/login')
}

const sendNumber = () => {
  refIdForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) {
      getPassCertWithId(userId.value).then(() => {
        setIsBeforeRemoveToken(true)        
        notify.success(t('xbuilder.view-forgot-password.notify1'))
        message.value = t('xbuilder.view-forgot-password.message2')
        tab.value = 2
      }).catch(e => {        
        notify.err('e.response.data.result.desc')
      })
    }
  })  
}

const certificationRequest = () => {
  refCertiForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) {
      certificate(certificationNumber.value).then(() => {
        initPassword().then(() => {          
          vm.$swal(t('xbuilder.view-forgot-password.message3')).then(res => {
            goToLogin()
          })                              
        })
      }).catch(() => {
        notify.err(t('xbuilder.view-forgot-password.notify2'))
      })
    }
  })
}
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
      class="auth-wrapper"
      no-gutters
    >
      <VCol
        lg="8"
        class="d-none d-lg-flex align-center justify-center position-relative"
      >
        <VImg
          max-width="768px"
          :src="authThemeImg"
          class="auth-illustration"
        />
        <VImg
          :width="276"
          :src="tree"
          class="auth-footer-start-tree"
        />
        <VImg
          class="auth-footer-mask"
          :src="authThemeMask"
        />
      </VCol>

      <VCol
        cols="12"
        lg="4"
        class="auth-card-v2 d-flex align-center justify-center"
      >
        <VCard
          flat
          :width="500"
          class="mt-12 mt-sm-0 pa-4"
        >
          <VCardText>
            <h5 class="text-h5 mb-1">
              {{ $t("xbuilder.msg.question-forgot-password") }}  🔒
            </h5>
            <p class="mb-0">
              {{ message }}
            </p>
          </VCardText>
          <v-window
            v-model="tab"
            disabled
          >
            <v-window-item            
              :value="1"
            >          
              <VCardText>                        
                <VForm
                  ref="refIdForm"
                  @submit.prevent="sendNumber"
                >
                  <VRow>
                    <!-- id -->                    
                    <VCol cols="12">
                      <VTextField
                        v-model="userId"
                        :label="$t('xbuilder.id')"
                        :rules="[required($t('xbuilder.msg.required-id'))]"
                        type="text"
                      />
                    </VCol>

                    <!-- Reset link -->
                    <VCol cols="12">
                      <VBtn
                        block
                        type="submit"
                      >
                        {{ $t("xbuilder.Send authentication number") }}
                      </VBtn>
                    </VCol>

                    <!-- back to login -->
                    <VCol
                      cols="12"
                      class="text-center"
                    >
                      <VBtn
                        variant="text"
                        class="text-primary ms-2"
                        @click="goToLogin"
                      >
                        <VIcon
                          class="flip-in-rtl"
                          icon="mdi-chevron-left"
                        />
                        <span>Back to login</span>
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>                    
              </VCardText>
            </v-window-item>
            <v-window-item            
              :value="2"
            >
              <VCardText>
                <VForm
                  ref="refCertiForm"
                  @submit.prevent="certificationRequest"
                >
                  <VRow>
                    <!-- 인증버호 -->
                    <VCol cols="12">
                      <VTextField        
                        v-model="certificationNumber"                
                        :label="$t('xbuilder.authentication number')"
                        :rules="[required($t('xbuilder.msg.required-authentication'))]"
                        type="text"
                      />
                    </VCol>

                    <!-- Reset link -->
                    <VCol cols="12">
                      <VBtn
                        block
                        type="submit"
                      >
                        {{ $t("Reset Password") }}
                      </VBtn>
                    </VCol>

                    <!-- back to login -->
                    <VCol
                      cols="12"
                      class="text-center"
                    >
                      <VBtn
                        variant="text"
                        class="text-primary ms-2"
                        @click="goToLogin"
                      >
                        <VIcon
                          class="flip-in-rtl"
                          icon="mdi-chevron-left"
                        />
                        <span>Back to login</span>
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>   
              </VCardText>              
            </v-window-item>          
          </v-window>              
        </VCard>        
      </VCol>           
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank    
  redirectIfLoggedIn: true
  removeToken: true
</route>
