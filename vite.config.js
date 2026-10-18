import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: { allow: ['.'] }
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the initial shell small and cache stable vendors separately from
        // route chunks (charts are only needed by the analytics dashboards).
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-charts': ['recharts'],
          'vendor-realtime': ['socket.io-client'],
        },
      },
    },
  },
})
