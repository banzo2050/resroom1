import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/services': path.resolve(__dirname, './src/services')
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  logLevel: 'info'
});
