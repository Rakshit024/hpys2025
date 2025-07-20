// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  // server: {
  //   host: "0.0.0.0", // ✅ Allow access from all devices (mobile, ngrok)
  //   port: 5173, // ✅ Consistent port for ngrok and localhost
  //   origin: "https://slowly-hip-badger.ngrok-free.app", // ✅ Your frontend ngrok URL
  //   hmr: {
  //     protocol: "wss",
  //     host: "slowly-hip-badger.ngrok-free.app",
  //     clientPort: 443,
  //   },
  //   headers: {
  //     "Access-Control-Allow-Origin": "*", // ✅ Allow for dev, change in prod
  //   },
  // },
  // preview: {
  //   host: "0.0.0.0",
  //   port: 4173,
  // },
});
