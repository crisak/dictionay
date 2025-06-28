import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [react()],
  /**
   * Configurar 2 puntos de entrar para la extensión de Chrome
   * 1. popup-top.html
   * 2. options.html
   */
  build: {
    outDir: 'dist/app',
    rollupOptions: {
      input: {
        'popup-top': resolve(__dirname, 'popup-top.html'),
        options: resolve(__dirname, 'options.html'),
      },
    },
  },
})
