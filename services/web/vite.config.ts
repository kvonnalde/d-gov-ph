import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    strictPort: false,
    proxy: {
      '/api': { target: process.env.DGOVPH_API_PROXY_TARGET ?? 'http://localhost:5000', changeOrigin: true },
    },
  },
});