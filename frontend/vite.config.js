// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // optional: raises warning threshold to 1000 KB
    build: {
      rollupOptions: {
        // Prevent minifying/react hoisting issues
        external: ["react", "react-dom"],
      },
    },
  },
});
