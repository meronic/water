import { useAppsStore } from '@/stores/apps'

export const useTheCustomizer = () => {
  const appsStore = useAppsStore()

  const isCustomizerOpen = computed({
    get() {
      return appsStore.isCustomizerOpen
    },
    set(value) {
      appsStore.toggleCustomizer(value)          
    },
  })

  
  return {
    isCustomizerOpen,
  }
}