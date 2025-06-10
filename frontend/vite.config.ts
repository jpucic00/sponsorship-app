import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../backend/dist/public'
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://sponsorship-app-production.up.railway.app/' 
          : 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})