import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port 5173 is allowed by the backend CORS_ORIGIN.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
