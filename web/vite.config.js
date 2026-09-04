import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The browser only ever calls relative /api/... — Vite forwards it to the
// Express server on 3001. No host in app code, no CORS, no API key here.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
