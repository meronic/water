<script setup>
import {
  HorizontalNavGroup,
  HorizontalNavLink,
  HorizontalNavMyMenu,
} from '@layouts/components'

const props = defineProps({
  navItems: {
    type: null,
    required: true,
  },
  navMyMenuItems: {
    type: null,
    required: true,
  },
})

const resolveNavItemComponent = item => {
  if ('children' in item)
    return HorizontalNavGroup
  
  return HorizontalNavLink
}
</script>

<template>
  <ul class="nav-items">
    <Component
      :is="resolveNavItemComponent(item)"
      v-for="(item, index) in navItems"
      :key="index"
      :item="item"
    />
    <HorizontalNavMyMenu :item="navMyMenuItems" />
  </ul>
</template>

<style lang="scss">
.layout-wrapper.layout-nav-type-horizontal {
  .nav-items {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
