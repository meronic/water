import { breakpointsVuetify } from '@vueuse/core'
import { VIcon } from 'vuetify/components'

// ❗ Logo SVG must be imported with ?raw suffix
import logo from '@images/favicon_32.png'
import { defineThemeConfig } from '@core'
import { RouteTransitions, Skins } from '@core/enums'
import { AppContentLayoutNav, ContentWidth, FooterType, NavbarType, TagViewType } from '@layouts/enums'

export const { themeConfig, layoutConfig } = defineThemeConfig({
  app: {
    systemCode: import.meta.env.VITE_SYSTEM_CODE,
    // title: '현대 삼호',
    subtitle: '주수 모니터링 시스템',

    // ❗ if you have SVG logo and want it to adapt according to theme color, you have to apply color as `color: rgb(var(--v-global-theme-primary))`
    logo: logo,
    contentWidth: ContentWidth.Fluid,
    contentLayoutNav: AppContentLayoutNav.Horizontal,
    overlayNavFromBreakpoint: breakpointsVuetify.md + 16,
    enableI18n: true,
    theme: 'light',
    isRtl: false,
    skin: Skins.Default,
    routeTransition: RouteTransitions.Fade,
    iconRenderer: VIcon,
    supportLocales: [
      { id: 'ko', name: '한국어' },
      { id: 'en', name: 'English' },
    ],
    apiVersion: '2.0.0',
    useRestfulAPI: false,
    onlyMockup: true,    
    showDetailLog: true,
  },
  menu: {
    isBookmarkHidden: false,
  },
  navbar: {
    type: NavbarType.Sticky,
    navbarBlur: true,
  },
  tagview: {
    type: TagViewType.Sticky,
  },
  footer: { type: FooterType.Static },
  verticalNav: {
    isVerticalNavCollapsed: false,
    defaultNavItemIconProps: { icon: 'mdi-circle-outline' },
    isVerticalNavSemiDark: false,
  },
  horizontalNav: {
    type: 'sticky',
    transition: 'slide-y-reverse-transition',
  },
  icons: {
    chevronDown: { icon: 'mdi-chevron-down' },
    chevronRight: { icon: 'mdi-chevron-right' },
    close: { icon: 'mdi-close' },
    verticalNavPinned: { icon: 'mdi-radiobox-marked' },
    verticalNavUnPinned: { icon: 'mdi-radiobox-blank' },
    sectionTitlePlaceholder: { icon: 'mdi-minus' },
  },  
})
