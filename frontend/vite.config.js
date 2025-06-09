import { defineConfig } from "vite";

export default defineConfig({
  root: "src", // Ensures Vite serves files from src/
  build: {
    rollupOptions: {
      input: {
        main: "src/index.html", // Main app
        login: "src/login.html", // Login page
      },
    },
  },
});
