import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://localhost:5150', // ✅ pontosan egyezik a backenddel
        changeOrigin: true,
        secure: false, // ⚠️ szükséges, mert a .NET dev cert önaláírt
        // ❌ NE töröljük az /api részt!
        // rewrite: path => path.replace(/^\/api/, '')  ⟵ ezt TÖRÖLJÜK
      }
    }
  }
})
