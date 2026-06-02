import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://liyolo.github.io",
  base: "/GitHubWeb",
  trailingSlash: "always",
  integrations: [sitemap()],
});
