import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port 3000 is allowed by the backend CORS_ORIGIN.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
});
