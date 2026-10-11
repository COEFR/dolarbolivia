import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Build del sitio de DólarBolivia para GitHub Pages:
//  - base './' => rutas relativas (funciona en dolarbolivia.site y en cualquier subcarpeta)
//  - alias '@' => src (el código usa imports '@/...')
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 3000,
  },
})
