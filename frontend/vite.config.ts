import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-icons'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
    commonjsOptions: {
      include: [/react-icons/, /node_modules/],
    },
  },
})