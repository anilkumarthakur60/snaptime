import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/package/index.ts"),
      name: "@anilkumarthakur/date",
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: false,
    emptyOutDir: true,
    cssCodeSplit: true,
  },
});
