import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@skyhook-io/k8s-ui': path.resolve(__dirname, '../packages/k8s-ui/src'),
    },
  },
  server: {
    port: 9273,
    proxy: {
      '/api': {
        target: 'http://localhost:9280',
        changeOrigin: true,
        ws: true, // WebSocket/SSE support
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@monaco-editor') || id.includes('node_modules/monaco-editor')) {
            return 'monaco'
          }
          if (id.includes('node_modules/shiki') || id.includes('node_modules/@shikijs')) {
            return 'shiki'
          }
          if (id.includes('node_modules/@xterm')) {
            return 'xterm'
          }
          if (id.includes('node_modules/elkjs') || id.includes('/packages/k8s-ui/src/components/topology/')) {
            return 'topology'
          }
          if (id.includes('node_modules/@xyflow')) {
            return 'reactflow'
          }
        },
      },
    },
  },
  // Handle client-side routing - serve index.html for all routes
  appType: 'spa',
})
