import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    open: true,
    proxy: {
      // Proxy API requests to backend server
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/interest': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/assessments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/pending': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/complete': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ocean': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/therapists': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/sessions': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/weekly-pulse': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/pulse-check': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/routines': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/guidance': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/wellbeing': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/habits': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/profile': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/complaints': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/students': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/marksheets': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/analytics': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
