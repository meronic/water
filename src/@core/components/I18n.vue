<script setup>
import { storedLocale } from '@/plugins/i18n'

const props = defineProps({
  languages: {
    type: Array,
    required: true,
  },
  location: {
    type: null,
    required: false,
    default: 'bottom end',
  },
})

const emit = defineEmits(['change'])
const currentLang = ref([storedLocale])
</script>

<template>
  <VBtn
    icon
    variant="text"
    color="default"
    size="small"
  >
    <VIcon
      icon="mdi-translate"
      size="24"
    />
    <!-- Menu -->
    <VMenu
      activator="parent"
      :location="props.location"
      offset="14px"
    >
      <!-- List -->
      <VList
        v-model:selected="currentLang"
        color="primary"
        min-width="175px"
      >
        <!-- List item -->
        <VListItem
          v-for="lang in props.languages"
          :key="lang.id"
          :value="lang.id"
          @click=" $emit('change', lang.id)"
        >
          <!-- Language label -->
          <VListItemTitle>{{ lang.name }}</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </VBtn>
</template>
