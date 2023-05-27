import staticAdapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: staticAdapter({
			fallback: 'fallback.html',
		}),
		serviceWorker: {
			register: false // process.env.NODE_ENV === 'development' ? false : true,
		},
	},

	compilerOptions: {
		cssHash: ({ hash, css }) => {
			return `oh-${hash(css)}`
		},
	},
}

export default config
