import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages 生产环境下严格使用仓库路径，本地开发使用相对路径
  base: process.env.NODE_ENV === 'production' ? '/LabelPrinter/' : './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
