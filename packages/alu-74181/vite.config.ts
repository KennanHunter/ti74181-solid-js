import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Alu74181",
      formats: ["es"],
      fileName: "alu-74181",
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "solid-js/store"],
    },
    sourcemap: true,
    target: "esnext",
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
