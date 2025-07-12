import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 開発環境ではHTTPSではなくhttpを使用するため、SSL証明証の検証を無効化
        secure: false,
        ws: false
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        cacheDir: false
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
})
