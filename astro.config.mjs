import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://nayuu-yuuna.github.io',
  base: '/Nayuu-portfolio',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    })
  ],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      wrap: true
    }
  }
});
