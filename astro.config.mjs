import react from '@astrojs/react';
import tokenJet from 'token-jet/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kram.land',
  integrations: [react()],
  vite: { plugins: [tokenJet()] },
});
