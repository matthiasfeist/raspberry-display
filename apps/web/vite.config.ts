import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: '../api/public',
    emptyOutDir: true,
  },
  plugins: [tailwindcss(), tsconfigPaths(), react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
