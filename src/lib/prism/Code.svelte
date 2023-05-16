<script lang="ts">
	/* eslint-disable svelte/valid-compile */

	import type { HastNode } from 'svelte-exmarkdown/types'
	import Children from 'svelte-exmarkdown/renderer/Children.svelte'
	import { highlight, languages } from './prism'
	export let children: HastNode[]
	export let properties: Record<string, unknown>

	let lang: string | undefined
	$: lang = String(properties.class).match(/language-(\w+)/)?.[1]
	let child: HastNode
	$: child = children[0]

	export let type: string
	export let tagName: string
	export let position: any
	export let __index: any
</script>

{#if lang == null || languages[lang] == null || child?.type !== 'text'}<code {...properties}
		><Children {children} /></code
	>{:else}<code {...properties}>{@html highlight(child.value, languages[lang], lang)}</code>{/if}

<style>
	code {
		background-color: var(--background);
	}
</style>
