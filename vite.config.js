import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages 生产环境下使用仓库路径，Electron 客户端与开发环境使用相对路径
  base: process.env.ELECTRON_BUILD === 'true' ? './' : (process.env.NODE_ENV === 'production' ? '/LabelPrinter/' : './'),
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
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist') || id.includes('pdf-lib')) {
              return 'pdf-engine';
            }
            if (id.includes('xlsx')) {
              return 'sheet-engine';
            }
            if (id.includes('jsbarcode') || id.includes('qrcode')) {
              return 'code-generators';
            }
            if (id.includes('lucide-vue-next')) {
              return 'ui-icons';
            }
            if (id.includes('vue')) {
              return 'vue-core';
            }
          }
        }
      }
    }
  }
});
