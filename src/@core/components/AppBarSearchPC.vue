<script setup>
import { useMenuStore } from '@hiway/stores/menu'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const menuStore = useMenuStore()
const { searchMenus } = storeToRefs(menuStore)

const targetMenus = computed(() => {
  return menus.value.filter(menu => {        
    return !('children' in menu)
  })
})

const searchQuery = ref('')

const valueSelected = value => {
  router.push(value.href).catch(() => {})
  searchQuery.value = ''
}

const selectedValue = ref('')

watch(selectedValue, newValue => {
  if(newValue) {
    router.push(newValue.href).catch(() => {})
    searchQuery.value = ''
  }
})
</script>

<template>
  <div style="width: 220px;">    
    <v-autocomplete                              
      v-model:search="searchQuery"
      v-model="selectedValue"
      color="primary"            
      hide-details
      hide-no-data      
      auto-select-firstr
      item-text="mnu_nm"
      return-object      
      append-inner-icon="mdi-magnify"
      rounded
      density="compact"
      variant="solo"    
      menu-icon=""
      :items="searchQuery? searchMenus : []"      
      height="32px"
      :placeholder="$t('Search Menu')"
    >
      <template #item="{props, item}">        
        <VListItem
          v-bind="props"
          :prepend-icon="item.value.icon_path || 'mdi-checkbox-blank-circle-outline'"
          :title="item.title"
          min-height="24"          
        />
        <!--
          <div class="w-full">
          <div
          class="d-flex align-content-end"
          >
          <v-icon
          size="item.icon_path ? 20 : 16"
          class="me-3"
          >
          {{ item.icon_path || 'mdi-checkbox-blank-circle-outline' }}
          </v-icon>
          <span class="text-sm">{{ item.title }}</span>
          </div>
          </div> 
        -->
      </template>
    </v-autocomplete>    
  </div>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend > .v-icon) {
   margin-inline-end: 8px !important
}

:deep(.v-input--density-compact .v-field--variant-solo,) {
  --v-input-control-height: 32px !important;
  // --v-input-padding-top: 4px !important;
}
// :deep(.v-field__append-inner) {
//   height: 32px;
//   padding-top: 4px;
// }
// :deep(.v-field__input) {
//   height: 32px;
// }
</style>
   