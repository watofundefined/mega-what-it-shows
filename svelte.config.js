import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

// `rendered/` is the kb as the desk sees it: every page prerendered to plain HTML, no client JS.
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({ extensions: ['.svx'], layout: { runbook } }),
  ],
  kit: {
    adapter: adapter({ pages: 'rendered', assets: 'rendered', strict: true }),
    alias: { '#lib': 'src/lib' },
    inlineStyleThreshold: Infinity,
    prerender: { entries: ['/kb'], handleHttpError: 'warn' },
  },
};
