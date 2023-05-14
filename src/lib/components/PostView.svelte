<script lang="ts">
	import { darkTheme } from '$lib/data/prefs'
	import { posts } from '$lib/posts/posts'
	import { highlightPlugin } from '$lib/prism'
	import Markdown from 'svelte-exmarkdown'
	import { gfmPlugin } from 'svelte-exmarkdown/gfm'

	export let id: string

	$: post = $posts[id]

	if (!post) posts.loadSingle(id)
</script>

<svelte:head>
	<link rel="stylesheet" href="/markdown-dark.css" />
	<link rel="stylesheet" href="/markdown-light.css" />
</svelte:head>

<div class="w-full flex flex-col">
	{#if post}
		<div id="info" class="flex flex-row justify-between items-center">
			<div class="flex flex-row items-center">
				<div class="flex flex-col">
					<span class="text-lg font-bold">{post.title}</span>
					<span class="text-sm font-bold">{post.author.username}</span>
				</div>
			</div>
			<span class="text-xs text-gray-500">{post?.date}</span>
		</div>
		<div id="content" class="markdown" class:dark={$darkTheme}>
			<Markdown md={post.content} plugins={[gfmPlugin, highlightPlugin]} />
		</div>
	{:else}
		<div class="w-full h-12 bg-gray-200 dark:bg-slate-600 rounded animate-pulse relative" />
	{/if}
</div>

<style lang="scss">
	.markdoawn {
		--text-color: #333;
		--link-color: #4183c4;

		--heading-color: #000;
		--h1-line-color: #ddd;
		--h2-line-color: #eee;
		--sub-heading-color: #777;

		--code-bg-color: #f8f8f8;
		--code-border-color: #ddd;
		--code-text-color: #333;

		&.dark {
			--text-color: #fff;
			--link-color: #4183c4;

			--heading-color: #fff;
			--h1-line-color: #ddd;
			--h2-line-color: #eee;
			--sub-heading-color: #777;

			--code-bg-color: #333;
			--code-border-color: #555;
			--code-text-color: #fff;
		}
	}
</style>
