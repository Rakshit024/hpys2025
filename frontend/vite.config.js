// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit:3000, // optional: raises warning threshold to 1000 KB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'three'; // separates three.js
            }
            if (id.includes('react')) {
              return 'react'; // separates react and react-dom
            }
            return 'vendor'; // all other node_modules
          }
        }
      }
    }
  }
});
