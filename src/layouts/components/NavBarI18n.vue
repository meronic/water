<script setup>
import NavBarI18n from '@core/components/I18n.vue'
import { useThemeConfig } from '@core/composable/useThemeConfig'
import { themeConfig } from '@themeConfig'
import { loadLanguageAsync } from '@/plugins/i18n'
import { useI18n } from 'vue-i18n'

const { isAppRtl } = useThemeConfig()


const i18nCompLanguages = themeConfig.app.supportLocales

const i18n = useI18n()

const handleLangChange = lang => {  
  loadLanguageAsync(i18n, lang)
  isAppRtl.value = lang === 'ar'
}
</script>

<template>
  <NavBarI18n
    :languages="i18nCompLanguages"
    @change="handleLangChange"
  />
</template>
