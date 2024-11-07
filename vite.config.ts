import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["react-icons"],
  },
  server: {
    port: 5000,
  },
  build: {
    assetsInlineLimit: 0, // Set to 0 to disable inlining
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
