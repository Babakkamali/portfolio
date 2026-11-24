import { defineConfig, type Plugin } from 'vite';
import { site } from './src/content/site.ts';
import { renderPage } from './src/render/page.ts';

/** Renders the page into index.html at build time, so it works without JavaScript. */
function renderPagePlugin(): Plugin {
  return {
    name: 'render-page',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace('<!--app-->', renderPage(site, new Date())),
    },
  };
}

export default defineConfig({
  plugins: [renderPagePlugin()],
});
