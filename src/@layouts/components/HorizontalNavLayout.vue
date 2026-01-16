<script setup>
import { HorizontalNav } from '@layouts/components'

// import { useLayouts } from '@layouts'
import { useLayouts } from '@layouts/composable/useLayouts'

import { useCommonStore } from '@hiway/stores/common'

const props = defineProps({
  navItems: {
    type: null,
    required: true,
  },
  navMyMenuItems: {
    type: Array,
    required: true,
  },
})

const { y: windowScrollY } = useWindowScroll()
const { width: windowWidth } = useWindowSize()
const router = useRouter()
const shallShowPageLoading = ref(false)
const commonStore = useCommonStore()

router.beforeEach(() => {
  shallShowPageLoading.value = true
})
router.afterEach(() => {
  shallShowPageLoading.value = false
})

const {
  _layoutClasses: layoutClasses,
  isNavbarBlurEnabled,
} = useLayouts()
</script>

<template>
  <div
    class="layout-wrapper"
    :class="[...layoutClasses(windowWidth, windowScrollY), { 'layout-full-screen': commonStore.isFullScreen}]"
  >
    <div
      class="layout-navbar-and-nav-container"
      :class="isNavbarBlurEnabled && 'header-blur'"
    >
      <!-- 👉 Navbar -->
      <div class="layout-navbar">
        <div class="navbar-content-container">
          <slot name="navbar" />
        </div>
      </div>
      <!-- 👉 Navigation -->
      <div class="layout-horizontal-nav">
        <div class="horizontal-nav-content-container">
          <HorizontalNav
            :nav-items="navItems"
            :nav-my-menu-items="navMyMenuItems"
          />
        </div>
      </div>
    </div>
    <!-- <div class="layout-tagview">
      <slot name="tagview" />
    </div>     -->
    <main class="layout-page-content">
      <template v-if="$slots['content-loading']">
        <template v-if="shallShowPageLoading">
          <slot name="content-loading" />
        </template>
        <template v-else>
          <slot />
        </template>
      </template>
      <template v-else>
        <slot />
      </template>
    </main>

    <!-- 👉 Footer -->
    <!-- <footer class="layout-footer">
      <div class="footer-content-container">
        <slot name="footer" />
      </div>
    </footer> -->
  </div>
</template>

<style lang="scss">
@use "@configured-variables" as variables;
@use "@layouts/styles/placeholders";
@use "@layouts/styles/mixins";

.layout-wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  &.layout-nav-type-horizontal {
    display: flex;
    flex-direction: column;

    // // TODO(v2): Check why we need height in vertical nav & min-height in horizontal nav
    // min-height: 100%;
    min-block-size: calc(var(--vh, 1vh) * 100);

    .layout-navbar-and-nav-container {
      z-index: 1;
    }

    .layout-navbar {
      z-index: variables.$layout-horizontal-nav-layout-navbar-z-index;
      block-size: variables.$layout-horizontal-nav-navbar-height;

      // ℹ️ For now we are not independently managing navbar and horizontal nav so we won't use below style to avoid conflicting with combo style of navbar and horizontal nav
      // If we add independent style of navbar & horizontal nav then we have to add :not for avoiding conflict with combo styles
      // .layout-navbar-sticky & {
      //   @extend %layout-navbar-sticky;
      // }

      // ℹ️ For now we are not independently managing navbar and horizontal nav so we won't use below style to avoid conflicting with combo style of navbar and horizontal nav
      // If we add independent style of navbar & horizontal nav then we have to add :not for avoiding conflict with combo styles
      // .layout-navbar-hidden & {
      //   @extend %layout-navbar-hidden;
      // }
    }

    .layout-tagview {
      z-index: variables.$layout-horizontal-nav-tagview-z-index;
      @include mixins.boxed-content;
    }

    // 👉 Navbar
    .navbar-content-container {
      @include mixins.boxed-content;
    }

    // 👉   Content height fixed
    &.layout-content-height-fixed {
      max-block-size: calc(var(--vh) * 100);

      
    }
    .layout-page-content {
        height: 75vh;    
        overflow: hidden;
    
        > :first-child {
          max-block-size: 100%;
          overflow-y: auto;
        }
      }

    // 👉 Footer
    // Boxed content
    .layout-footer {
      .footer-content-container {
        @include mixins.boxed-content;
      }
    }
  }

  // If both navbar & horizontal nav sticky
  &.layout-navbar-sticky.horizontal-nav-sticky {
    .layout-navbar-and-nav-container {
      position: sticky;
      inset-block-start: 0;
      will-change: transform;
    }
  }

  &.layout-navbar-hidden.horizontal-nav-hidden {
    .layout-navbar-and-nav-container {
      display: none;
    }    
  }

  &.layout-tagview-sticky {
    .layout-tagview {
      position: sticky;            
    }
  }

  &.layout-tagview-sticky.layout-navbar-sticky {
    .layout-tagview {      
      inset-block-start: calc(variables.$layout-horizontal-nav-navbar-height + 65.19px);      
    }
  }

  &.layout-tagview-sticky.layout-navbar-hidden {
    .layout-tagview {
      inset-block-start: 0
    }    
  }
  &.layout-tagview-sticky.layout-navbar-static {
    .layout-tagview {
      inset-block-start: 0
    }    
  }
  &.layout-tagview-hidden .layout-tagview{
    display: none
  }  
}

// 👉 Horizontal nav nav
.layout-horizontal-nav {
  z-index: variables.$layout-horizontal-nav-z-index;

  // .horizontal-nav-sticky & {
  //   width: 100%;
  //   will-change: transform;
  //   position: sticky;
  //   top: 0;
  // }

  // .horizontal-nav-hidden & {
  //   display: none;
  // }

  .horizontal-nav-content-container {
    @include mixins.boxed-content(true);
  }
}
.navbar-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .logo {
    width: 170px;
    height: 32px;
  }

  .navbar-left,
  .navbar-right {
    display: flex;
    align-items: center;
    z-index: 2;
  }

  .navbar-right {
    margin-left: auto;
  }

  .nav-center-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
}
</style>
