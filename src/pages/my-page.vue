<template>
  <v-container fluid>
    <v-card
      class="auth-card mx-auto"
      width="28rem"
    >
      <v-card-text>
        <p class="text-2xl font-weight-semibold text--primary mb-2">
          My Page 🔒
        </p>        
      </v-card-text>
      <v-card-text>
        <v-form ref="changePasswordForm">
          <v-text-field
            v-model="userId"
            outlined
            hide-details
            :label="$t('xbuilder.id')"
            disabled
            class="mb-3"
          />
          <v-text-field
            v-model="currentPassword"
            outlined
            :type="isCurrentPasswordVisible ? 'text' : 'password'"
            :label="$t('xbuilder.Current password')"
            :append-icon="isCurrentPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            hide-details="auto"
            class="mb-3"
            :rules="[validator.required($t('xbuilder.msg.required-current-password'))]"
            validate-on-blur
            @click:append="isCurrentPasswordVisible = !isCurrentPasswordVisible"
          />
          <v-text-field
            v-model="password"
            outlined
            :type="isPasswordVisible ? 'text' : 'password'"
            :label="$t('xbuilder.password')"
            :append-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            hide-details="auto"
            class="mb-3"
            :rules="[validator.required($t('xbuilder.msg.required-new-password')), validator.passwordValidator]"
            validate-on-blur
            @click:append="isPasswordVisible = !isPasswordVisible"
          />
          <v-text-field
            v-model="confirmPassword"
            outlined
            :type="isConfirmPasswordVisible ? 'text' : 'password'"
            :label="$t('xbuilder.Confirm password')"
            :append-icon="isConfirmPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            hide-details="auto"
            class="mb-3"
            :rules="[validator.confirmedValidator(password, confirmPassword)]"
            @click:append="isConfirmPasswordVisible = !isConfirmPasswordVisible"
          />
          <v-text-field
            v-model="userName"
            outlined
            hide-details
            :label="$t('xbuilder.Name')"
            disabled
            class="mb-3"
          />
          <v-text-field
            v-model="asgnShrtNm"
            outlined
            hide-details
            :label="$t('xbuilder.Affiliation')"
            disabled
            class="mb-3"
          />
          <v-text-field
            v-model="jobTitNm"
            outlined
            hide-details
            :label="$t('xbuilder.Position')"
            disabled
            class="mb-3"
          />
          <v-btn 
            block
            color="primary"
            class="mt-4"
            @click="fnChangePassword"
          >
            {{ $t("xbuilder.Change Password") }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
  
<script>
// eslint-disable-next-line object-curly-newline
import { ref, computed, nextTick } from 'vue'
import { getUserInfoBySession } from '@hiway/api/login'
import { getUserList } from '@hiway/api/organizations'
import { changePassword } from '@hiway/api/user'
import { required, confirmedValidator, passwordValidator } from '@hiway/utils/validation'
import Message from '@hiway/utils/notify'
import { useUserStore } from '@hiway/stores/user'
import { useI18n } from 'vue-i18n'
  
export default {
  setup() {
    const { t } = useI18n()    
    const userStore = useUserStore()

    // form el
    const changePasswordForm = ref(null)
  
    // password text
    const isCurrentPasswordVisible = ref(false)
    const isPasswordVisible = ref(false)
    const isConfirmPasswordVisible = ref(false)

    const userId = computed(() => {
      return userStore.userId
    })
  
    // form model
    const currentPassword = ref('')
    const password = ref('')
    const confirmPassword = ref('')

    const userName = computed(() => {
      return userStore.userName
    })

    const asgnShrtNm = ref('')
    const jobTitNm = ref('')
  
    getUserInfoBySession().then(res => {
      nextTick(() => {
        getUserList({ user_id: res.user_id }).then(res => {
          if (res.length === 0) {
            return
          }
          asgnShrtNm.value = res[0].asgn_shrt_nm
          jobTitNm.value = res[0].job_tit_nm
        })
      })
    })
  
    const fnChangePassword = () => {
      if (changePasswordForm.value.validate()) {
        const params = {
          password: password.value,
          old_password: currentPassword.value,
          renewPw: confirmPassword.value,
        }

        changePassword(params).then(res => {          
          if (res.body === true) {
            Message.success(t('xbuilder.msg.complete-password'))
            password.value = ''
            currentPassword.value = ''
            confirmPassword.value = ''
          } else if (res.body === false) {
            Message.err(t('xbuilder.msg.not-match-password'))
          }
        })
      }
    }
  
    return {
      // form el
      changePasswordForm,
  
      // password text
      isCurrentPasswordVisible,
      isPasswordVisible,
      isConfirmPasswordVisible,
  
      // form model
      userId,
      currentPassword,
      password,
      confirmPassword,
      userName,
      asgnShrtNm,
      jobTitNm,
      fnChangePassword,
      validator: {
        required,
        confirmedValidator,
        passwordValidator,
      },
    }
  },
}
</script>
  
<route lang="yaml">
meta:    
    noAuth: true
    noHistory: true
</route>
  