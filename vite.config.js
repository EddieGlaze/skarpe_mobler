import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // ← Use root for production on custom domains or DigitalOcean
  plugins: [react()],
})
