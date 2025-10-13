import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    exclude: ['@arcgis/core']
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@arcgis/core')) {
            return 'arcgis';
          }
        }
      }
    }
  }
});
