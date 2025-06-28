import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs-extra'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      writeBundle() {
        // Copy static files
        ;['manifest.json'].forEach((file) => {
          fs.copySync(
            resolve(__dirname, `src/${file}`),
            resolve(__dirname, `dist/${file}`),
          )
        })

        fs.copySync(
          resolve(__dirname, 'src/background.js'),
          resolve(__dirname, 'dist/content/background.js'),
        )
      },
    },
  ],
  /**
   * Configurar 2 puntos de entrar para la extensión de Chrome
   * 1. popup-top.html
   * 2. options.html
   */
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.tsx'),
      },
      output: {
        // Formato IIFE para que se auto-ejecute
        format: 'iife',
        // El nombre de la variable global que contendrá tu módulo
        name: 'content',
        // Directorio de salida
        dir: 'dist/content',
        // Nombre del archivo de salida
        entryFileNames: 'content.js',
        // Asegúrate de que todos los chunks estén en un solo archivo
        inlineDynamicImports: true,
        // No generar archivos de código dividido
        manualChunks: undefined,
        // Incluir el contenido de todos los chunks en el archivo principal
        chunkFileNames: '[name].js',
      },
    },
  },
})
