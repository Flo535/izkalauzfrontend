import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5175,
    open: true,
    proxy: {
      '/api': {
        target: 'https://localhost:5150',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
