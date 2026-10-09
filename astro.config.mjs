import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import tokenJetResponsive from 'token-jet-responsive-css-modules/vite';
import tokenJet from 'token-jet/vite';

export default defineConfig({
  site: 'https://kram.land',
  integrations: [react()],
  vite: { plugins: [tokenJet(), tokenJetResponsive()] },
});
