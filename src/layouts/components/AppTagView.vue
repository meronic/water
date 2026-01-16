<template>
  <div
    class="py-1 full app-tag"    
  >
    <div
      class="mx-auto"      
    >      
      <VSlideGroup
        ref="appTagSlideGroup"
        show-arrows
      >
        <VSlideGroupItem
          v-for="tag in tagsStore.visitedViews"
          :key="tag.path"
        >          
          <VChip
            ref="tags"              
            size="small"
            closable
            link            
            class="ma-1"
            :class="{'bg-primary': isActive(tag)}"
            draggable   
            :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"            
            @click:close="closeTag($event,tag)"
          >
            <VIcon>{{ getMenuIcon(tag) }}</VIcon>            
            {{ $t(getMenuTitle(tag)) }}            
          </VChip>
        </VSlideGroupItem>
      </VSlideGroup>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTagsStore } from '@hiway/stores/tags'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { config } from '@layouts/config'
import { useMenuStore } from '@/@hiway/stores/menu'
import { find } from 'lodash-es'

const route = useRoute()
const router = useRouter()
const tagsStore = useTagsStore()
const menuStore = useMenuStore()
const { t } = useI18n()

watch(() => route.path, () => {
  tagsStore.addVisitedView(route, t)
  tagsStore.addCachedView(route)
  
}, { immediate: true })

const getMenuTitle = tag => {  
  const targetMenu = find(menuStore.menus, { href: tag.path })
  
  return !targetMenu ? tag.name : targetMenu.menu_id
}

const getMenuIcon = tag => {
  const targetMenu = find(menuStore.menus, { href: tag.path })

  return !targetMenu || !targetMenu.icon_path ? config.verticalNav.defaultNavItemIconProps.icon : targetMenu.icon_path

}

const isActive = tag => {  
  return tag.path === router.currentRoute.value.path
}

const closeTag = (event,tag) => {  
  event.preventDefault()
  tagsStore.deleteVisitedView(tag)  
  tagsStore.deleteCachedView(tag)
  if(isActive(tag)) {
    const latestView = tagsStore.visitedViews.slice(-1)[0]
    
    if(latestView) {
      router.push({ path: latestView.path, query: latestView.query, fullPath: latestView.fullPath })
    } else {      
      router.push('/')
    }
  }
}
</script>
  