import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify'


export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  plugins: [
    Vue(),
    AutoImport({
      imports: ['vue'],
      resolvers: [
        ElementPlusResolver(),

        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),

    Components({
      resolvers: [
        IconsResolver({
          enabledCollections: ['ep'],
        }),
        ElementPlusResolver()
      ],
    }),
    Icons({
      autoInstall: true,
    }),
  ],
})
