import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://et21.com.ar',
  integrations: [tailwind()],
  build: {
    format: 'directory',
  },
  compressHTML: true,
});
