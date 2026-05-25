import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Chat API 
      // All /api/* calls go to the Chat Orchestrator (port 8081)
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },

      // Health checks
      // MCP Server actuator (port 8080)
      '/health/mcp': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: () => '/actuator/health',
      },

      // Orchestrator actuator (port 8081)
      '/health/orchestrator': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: () => '/actuator/health',
      },
    },
  },
})
