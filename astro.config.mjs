import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import responsiveCssModules from 'responsive-css-modules/vite';
import tokenJet from 'token-jet/vite';

export default defineConfig({
  site: 'https://kram.land',
  integrations: [react()],
  vite: { plugins: [tokenJet(), responsiveCssModules()] },
});
