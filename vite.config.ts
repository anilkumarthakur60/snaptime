import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/package/index.ts"),
      name: "D8",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      output: {
        exports: "named",
      },
    },
    sourcemap: false,
    emptyOutDir: true,
  },
});
