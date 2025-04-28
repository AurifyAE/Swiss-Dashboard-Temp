import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
        '/firebaseUtils.js': {
            target: 'http://localhost:5173', // Assuming you're running Vite on localhost:5173
            changeOrigin: true,
            secure: false
        }
    }
}
})
