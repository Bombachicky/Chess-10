import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:21530",
      },
      "/join-room": {
        target: "ws://localhost:21530/",
        ws: true,
      },
      "/create-room": {
        target: "ws://localhost:21530/",
        ws: true,
      },
    },
  },
  plugins: [react()],
})
