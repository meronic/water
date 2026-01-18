import { fileURLToPath } from 'url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import DefineOptions from 'unplugin-vue-define-options/vite'
import { defineConfig, loadEnv } from 'vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import vuetify from 'vite-plugin-vuetify'
import federation from '@originjs/vite-plugin-federation'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import prefixer from 'postcss-prefix-selector'
import autoprefixer from 'autoprefixer'

// import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }  

  return defineConfig({
    base: process.env.VITE_BASE_URL,
    server: {
      // 🔧 Mock 모드: API 프록시 비활성화 (로컬 Mock 데이터만 사용)
      // 백엔드 없이 UI 테스트용
      // proxy: {
      //   '/hiway': 'http://172.17.10.68',
      //   '/api': { target: 'http://localhost:8144', ... },
      // },
    },
    plugins: [
      vue(),
      vueJsx(),

      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
      vuetify({
        styles: {
          configFile: 'src/styles/variables/_vuetify.scss',
        },
      }),
      Pages({
        dirs: ['./src/pages'],
      }),
      Layouts({
        layoutsDirs: './src/layouts/',
      }),
      Components({
        dirs: ['src/@core/components', 'src/views/demos'],
        dts: true,
      }),
      AutoImport({
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
        },
        imports: ['vue', 'vue-router', '@vueuse/core', '@vueuse/math', 'pinia', 'vue-i18n'],
        vueTemplate: true,
      }),
      VueI18n({
        runtimeOnly: true,
        compositionOnly: true,
        include: [
          fileURLToPath(new URL('./src/plugins/i18n/locales/**', import.meta.url)),
        ],
      }),
      DefineOptions(),
      federation({
        name: 'hosts',
        remotes: {
          remote_app: process.env.VITE_MANAGE_REMOTE_URL,          
        },
        shared: ['vue','pinia','vue-demi'],
      }),

      // visualizer({
      //   template: 'treemap',
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: 'analyse.html',
      // }),
    ],
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@themeConfig': fileURLToPath(new URL('./themeConfig.js', import.meta.url)),
        '@core': fileURLToPath(new URL('./src/@core', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/@layouts', import.meta.url)),
        '@images': fileURLToPath(new URL('./src/assets/images/', import.meta.url)),
        '@styles': fileURLToPath(new URL('./src/styles/', import.meta.url)),
        '@configured-variables': fileURLToPath(new URL('./src/styles/variables/_template.scss', import.meta.url)),
        '@axios': fileURLToPath(new URL('./src/plugins/axios', import.meta.url)),
        '@validators': fileURLToPath(new URL('./src/@core/utils/validators', import.meta.url)),
        'apexcharts': fileURLToPath(new URL('node_modules/apexcharts-clevision', import.meta.url)),
        '@hiway': fileURLToPath(new URL('./src/@hiway', import.meta.url)),
      },
    },
    build: {
      chunkSizeWarningLimit: 5000,
      target: ["chrome89", "edge89", "firefox89", "safari15"],
    },
    optimizeDeps: {
      exclude: ['vuetify'],
      entries: [
        './src/**/*.vue',
      ],
    },
    css: {
      postcss: {
        plugins: [
          prefixer({
            prefix: `#${process.env.VITE_SYSTEM_CODE}`,
            exclude: ['html', 'body', '*'],
            // eslint-disable-next-line consistent-return
            transform: (prefix, selector, prefixedSelector) => {            
              if (selector.startsWith('.')) {
                return prefixedSelector
              }
            
              return selector
            },          
          }),
          autoprefixer({}),
        ],
      },
    },
  })
}
