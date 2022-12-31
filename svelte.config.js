import preprocess from 'svelte-preprocess'
import vercel from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		preprocess({
			postcss: true
		})
	],
	kit: {
		adapter: vercel({
			edge: true
		}),
		alias: {
			src: 'src',
			components: 'src/components',
			lib: 'src/lib',
			routes: 'src/routes',
			styles: 'src/styles',
			tokens: 'src/tokens',
			types: 'src/types'
		}
	}
}

export default config
