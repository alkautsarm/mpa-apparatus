import { resolve } from "node:path";
import { globSync } from "glob";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// Auto-discover all MPA entry points from pages/*.html
const pages = Object.fromEntries(
  globSync("pages/*.html").map((file) => [
    file.replace(/^pages\/(.+)\.html$/, "$1"),
    resolve(__dirname, file),
  ]),
);

// In dev, rewrite clean URLs to their HTML entry files so Wouter routes match.
// e.g. GET /auth/login → serve pages/auth.html (Wouter handles /auth/login client-side)
// This mirrors the server routing you'd configure in production.
const devHtmlRewritePlugin = (): Plugin => ({
  name: "dev-html-rewrite",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (!req.url) return next();
      const url = req.url.split("?")[0];

      // Map each discovered page name to its HTML file
      for (const name of Object.keys(pages)) {
        const prefix = name === "home" ? "/" : `/${name}`;
        if (url === prefix || url === `${prefix}/` || url.startsWith(`${prefix}/`)) {
          req.url = `/pages/${name}.html`;
          return next();
        }
      }

      next();
    });
  },
});

const sentryPlugin = process.env.SENTRY_AUTH_TOKEN
  ? sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    })
  : null;

export default defineConfig({
  plugins: [react(), tailwindcss(), devHtmlRewritePlugin(), sentryPlugin].filter(Boolean),
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: pages,
    },
  },
});
