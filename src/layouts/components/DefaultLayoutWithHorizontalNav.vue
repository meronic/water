<script setup>
import { useThemeConfig } from '@core/composable/useThemeConfig'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import { HorizontalNavLayout } from '@layouts'

import { storeToRefs } from 'pinia'
import { useMenuStore } from '@hiway/stores/menu'
import { useTagsStore } from '@hiway/stores/tags'

import NavbarI18n from '@/layouts/components/NavBarI18n.vue'
import NavBarFullScreen from '@/layouts/components/NavBarFullScreen.vue'
import tagView from '@/layouts/components/AppTagView.vue'
import NavBarBookmark from '@/layouts/components/NavBarBookmark.vue'
import AppBarSearchPC from '@core/components/AppBarSearchPC.vue'
import TheCustomizer from '@core/components/TheCustomizer.vue'

const { appRouteTransition } = useThemeConfig()
const { treeMenus, myMenus } = storeToRefs(useMenuStore())
const tagsStore = useTagsStore()
</script>

<template>
  <HorizontalNavLayout :nav-items="treeMenus" :nav-my-menu-items="myMenus">
    <!-- 👉 Tagview -->
    <template #tagview>
      <tagView />
    </template>

    <!-- 👉 Navbar -->
    <template #navbar>
      <div class="navbar-inner">
        <!-- 좌측: 로고 + 타이틀 -->
        <div class="navbar-left d-flex align-center gap-x-3">
          <RouterLink to="/" class="d-flex align-center gap-x-2">
            <img :src="themeConfig.app.logo" class="logo" />
            <h1 class="text-xl font-weight-medium mb-0">
              {{ themeConfig.app.title }}
            </h1>
          </RouterLink>
        </div>

        <!-- 중앙: subtitle (절대 위치) -->
        <div class="nav-center-text text-xl font-weight-medium">
          {{ themeConfig.app.subtitle }}
        </div>

        <!-- 우측: 아이콘들 -->
        <div class="navbar-right d-flex align-center gap-x-2 ms-auto">
          <AppBarSearchPC />
          <NavBarBookmark />
          <NavbarI18n />
          <NavbarThemeSwitcher />
          <NavBarFullScreen />
          <UserProfile />
        </div>
      </div>
    </template>


    <!-- 👉 페이지 영역 -->
    <RouterView v-slot="{ Component }">
      <Transition :name="appRouteTransition" mode="out-in">
        <KeepAlive :include="tagsStore.cachedViews">
          <Component :is="Component" />
        </KeepAlive>
      </Transition>
    </RouterView>

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <TheCustomizer />
  </HorizontalNavLayout>
</template>