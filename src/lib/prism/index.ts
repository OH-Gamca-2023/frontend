import type { Plugin } from 'svelte-exmarkdown';
import Code from './Code.svelte';

export const highlightPlugin: Plugin = {
	renderer: {
		'code': Code
	}
};