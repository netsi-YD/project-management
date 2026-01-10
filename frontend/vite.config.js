import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true // Automatically opens browser
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
