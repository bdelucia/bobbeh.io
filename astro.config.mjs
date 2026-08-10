// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import Icons from "unplugin-icons/vite";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://www.bobbeh.io",

  integrations: [
    mdx(),
    sitemap(),
    svelte(),
    icon(),
    react(),
    markdoc(),
    keystatic(),
  ],

  vite: {
    plugins: [
      Icons({
        compiler: "svelte",
      }),
    ],
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Open Sans",
      cssVariable: "--font-sans",
      fallbacks: ["sans-serif"],
      // Variable font range (Open Sans max weight is 800).
      weights: ["300 800"],
      styles: ["normal"],
    },
    {
      provider: fontProviders.local(),
      name: "CaskaydiaCove Nerd Font",
      cssVariable: "--font-caskaydia",
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/CaskaydiaCoveNerdFont-Regular.ttf"],
            weight: 400,
            style: "normal",
          },
        ],
      },
    },
  ],

  adapter: vercel(),
});
