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
			routes: 'src/routes',
			static: 'static',
			types: 'src/types'
		}
	}
}

export default config
