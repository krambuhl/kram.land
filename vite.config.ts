import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { vanillaExtractPlugin } from 'styled-vanilla-extract/vite';
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  return {
    build: { sourcemap: true },
    plugins: [qwikCity(), qwikVite(), tsconfigPaths(), vanillaExtractPlugin()],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
