import { defineConfig } from "rollup";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
// import html from "@rollup/plugin-html";
// import { readFileSync } from "fs";
// import copy from "rollup-plugin-copy";

export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "L",
      extend: true,
      sourcemap: true,
      globals: {
        leaflet: "L",
        "@turf/turf": "turf",
      },
    },
  ],
  external: ["leaflet", "@turf/turf"],
  plugins: [
    typescript(),
    terser(),
    // html({
    //   title: "Leaflet.MaskHalo Example",
    //   template: ({ attributes, bundle, files, publicPath, title }) => {
    //     const template = readFileSync("example/index.html", "utf-8");

    //     return template;
    //   },
    // }),
    // copy({
    //   targets: [
    //     {
    //       src: "dist",
    //       dest: "example",
    //     },
    //   ],
    // }),
  ],
});
