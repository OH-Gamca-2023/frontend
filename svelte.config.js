import staticAdapter from '@sveltejs/adapter-static';
import vercelAdapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: getAdapter(),
	}
};

export default config;

function getAdapter() {
	if (process.env.VERCEL) {
		return vercelAdapter({

		});
	} else {
		return staticAdapter({
			pages: 'build',
			assets: 'build',
			fallback: null
		});
	}
}