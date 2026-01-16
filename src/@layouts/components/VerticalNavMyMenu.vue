<script setup>
import { ref, watch, getCurrentInstance } from 'vue'
import draggable from 'vuedraggable'
import { cloneDeep, findIndex } from 'lodash-es'
import { config } from '@layouts/config'
import {  
  isNavLinkActive,
} from '@layouts/utils'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/@hiway/stores/user'
import { useMenuStore } from '@/@hiway/stores/menu'
import { saveMyMenu } from '@hiway/api/menu'
import notify from '@/@hiway/utils/notify'

const props = defineProps({
  navMyMenuItems: {
    type: Array,
    required: true,
  },    
})

const { t } = useI18n()

const vm = getCurrentInstance().proxy
const myMenuItems = ref(props.navMyMenuItems)
const isEditable = ref(false)
let originData = []
let deleted = []
let isUpdated = false

const startEdit = () => {
  originData = cloneDeep(myMenuItems.value)
  isUpdated = false
  deleted = []
  isEditable.value = true  
}

const cancelEdit = () => {
  isEditable.value = false
  myMenuItems.value = cloneDeep(originData)
}

const changeDrag = () => {
  isUpdated = true
}

const addDeleted = item => {
  deleted.push(item)
  myMenuItems.value.splice(findIndex(myMenuItems.value, item),1)
}

const userStore = useUserStore()
const menuStore = useMenuStore()

const saveMyMenuItems = () => {
  if(!isUpdated && deleted.length === 0) {
    notify.warn('변경된 내용이 없습니다.')
    
    return
  }
  vm.$swal({ title: t("xbuilder.msg.question-save"), showCancelButton: true }).then(res => {
    if (res.isConfirmed) {
      if(isUpdated) {
        myMenuItems.value.forEach((item, index) => {
          item.mnu_seq = index
        })
      }

      const bookMarkSaveData = {
        updated: isUpdated ? myMenuItems.value : [],
        deleted,
        retrieveData: { userId: userStore.userId },
      }
      
      saveMyMenu(bookMarkSaveData).then(res => {
        menuStore.getMyMenus()
        isEditable.value = false
        notify.success('저장이 완료 되었습니다.')        
      }).catch(e => {
        console.error(e, '즐겨찾기 저장 중 에러')
        notify.err('잠시 후 다시 시도해주세요.')
      })     
    } 
  })

}

watch(() => props.navMyMenuItems, newValues => {
  myMenuItems.value = newValues
})
</script>

<template>
  <v-list
    class="pe-2"
    style="backgrond: inherit;"
  >
    <div      
      class="d-flex justify-end py-1"
    >
      <v-btn
        v-if="!isEditable"
        size="small"
        color="primary"        
        @click="startEdit"
      >
        편집
      </v-btn>
      <template v-else>
        <v-btn
          size="small"
          class="mr-1"          
          @click="saveMyMenuItems"
        >
          저장
        </v-btn>
        <v-btn
          size="small"          
          @click="cancelEdit"
        >
          취소
        </v-btn>
      </template>
    </div>
    <draggable
      v-model="myMenuItems"
      item-key="mymenu_id"
      handle=".move"
      @change="changeDrag"
    >
      <template #item="{ element }">
        <v-list-item                              
          class="vertical-nav-menu-link rounded-e-xl"      
          active-class="bg-gradient-primary"          
          :to="isEditable ? '' : element.path"
          :active="isNavLinkActive({href: element.path}, $router)"
        >          
          <template #prepend>
            <v-btn           
              v-if="isEditable"         
              size="small"
              class="move"
              style="cursor: move;"
              icon="mdi-cursor-move"
              variant="plain"
              color="default"          
            />        
            <v-icon v-else>
              {{ element.icon_path || config.verticalNav.defaultNavItemIconProps.icon }}
            </v-icon>
          </template>               
          <v-list-item-title>
            {{ element.mymenu_nme }}
          </v-list-item-title>
          <v-list-item-subtitle
            class="text-caption"              
          >
            {{ element.prnts_path }}
          </v-list-item-subtitle>          
          <template
            v-if="isEditable"
            #append
          >
            <v-btn          
              size="x-small"
              icon="mdi-minus"
              color="primary"
              variant="outlined"                    
              height="20"
              width="20"
              @click="addDeleted(element)"
            />
          </template>
        </v-list-item>
      </template>
    </draggable>    
  </v-list>
</template>

<style lang="scss" scoped>
.bg-gradient-primary {
  background: linear-gradient(-72.47deg, rgb(var(--v-global-theme-primary)) 22.16%, rgba(var(--v-global-theme-primary), 0.7) 76.47%) !important;
  color: rgb(var(--v-theme-on-primary));
}

.v-list {
  background: inherit !important;
}
</style>
