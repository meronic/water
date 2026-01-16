<script setup>
import { useLayouts } from '@layouts'
import {
  HorizontalNavLink,
  HorizontalNavPopper,
  VerticalNavMyMenu,
} from '@layouts/components'
import { config } from '@layouts/config'
import { canViewNavMenuGroup } from '@layouts/plugins/casl'
import { isNavGroupActive } from '@layouts/utils'
import draggable from 'vuedraggable'
import { useThemeConfig } from '@core/composable/useThemeConfig'

const props = defineProps({
  item: {
    type: null,
    required: true,
  },
  childrenAtEnd: {
    type: Boolean,
    required: false,
    default: false,
  },
  isSubItem: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const route = useRoute()
const router = useRouter()
const { dynamicI18nProps, isAppRtl } = useLayouts()
const isGroupActive = ref(false)
const myMenuItems = ref(props.item)

watch(() => route.path, () => {
  const isActive = isNavGroupActive(props.item, router)

  isGroupActive.value = isActive
}, { immediate: true })

const { isBookmarkHidden } = useThemeConfig()
</script>

<template>  
  <HorizontalNavPopper    
    :is-rtl="isAppRtl"
    class="nav-group"
    tag="li"
    content-container-tag="ul"
    :class="[{
      'active': isGroupActive,
      'children-at-end': childrenAtEnd,
      'sub-item': isSubItem,
      'disabled': item.disable,
    }]"
    :popper-inline-end="childrenAtEnd"
  >
    <div
      v-if="!isBookmarkHidden"
      class="nav-group-label"
    >
      <v-icon class="nav-item-icon">
        mdi-star
      </v-icon>
      <span class="nav-item-title">
        {{ $t("xbuilder.Bookmarks") }}
      </span>
      <Component
        v-bind="config.icons.chevronDown"
        :is="config.app.iconRenderer || 'div'"
        class="nav-group-arrow"
      />
    </div>

    <template #content>
      <div style="min-width: 250px;">
        <VerticalNavMyMenu :nav-my-menu-items="item" />
      </div>
    </template>
  </HorizontalNavPopper>
</template>

<style lang="scss">
.layout-horizontal-nav {
  .nav-group {
    .nav-group-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .popper-content {
      z-index: 1;

      > div {
        overflow-x: hidden;
        overflow-y: auto;
      }
    }
  }
}
</style>
