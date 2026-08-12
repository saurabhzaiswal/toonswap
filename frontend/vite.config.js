import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    // Production source maps expose implementation details without stopping DevTools.
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    port: 5173,
    strictPort: true,
  },
});
