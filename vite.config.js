import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/tariff/api': {
        target: 'https://rajaongkir.komerce.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tariff\/api/, '/api')
      },
    },
    allowedHosts: [
      '236a-36-72-215-206.ngrok-free.app',
      'all'
    ]
  }
})

