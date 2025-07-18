import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 👇 Add this import
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    esbuildOptions: {
      // 👇 This injects a browser-safe polyfill for `global`
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // 🚫 silences the warning (1000 kB instead of 500)
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
          vuetify: ['vuetify'],
          vendor: ['axios'],
        },
      },
    },
  },
})
