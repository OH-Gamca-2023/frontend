<script lang="ts">
	import type { PageData } from './$types'
	import 'prismjs/themes/prism.min.css'
	import '../../../../../markdown.css'

	import { darkTheme } from '$lib/data/prefs'
	import { posts } from '$lib/api/models'
	import { highlightPlugin } from '$lib/prism'
	import Markdown from 'svelte-exmarkdown'
	import { gfmPlugin } from 'svelte-exmarkdown/gfm'

	export let data: PageData

	$: post = $posts[data.postId]

	if (!post) posts.loadSingle(data.postId)
</script>

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
