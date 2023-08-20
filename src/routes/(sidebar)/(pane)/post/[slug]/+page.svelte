<script lang="ts">
	import type { PageData } from './$types'
	import 'prismjs/themes/prism.min.css'
	import '../../../../../markdown.css'

	import { darkTheme } from '$lib/data/settings'
	import { posts } from '$lib/api/models'
	import { highlightPlugin } from '$lib/prism'
	import Markdown from 'svelte-exmarkdown'
	import { gfmPlugin } from 'svelte-exmarkdown/gfm'
	import Icon from '$lib/components/Icon.svelte'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'

	export let data: PageData

	$: post = $posts[data.postId]

	if (!post) posts.loadSingle(data.postId)

	$: browser && post.redirect && goto(post.redirect)

	$: authorFullName = post?.author.first_name + ' ' + post?.author.last_name
</script>

<div class="w-full flex flex-col">
	{#if post}
		<div id="info" class="flex flex-row justify-between items-center">
			<div class="flex flex-col md:flex-row md:items-center justify-between w-full">
				<div class="flex flex-col pb-2 md:pb-0 whitespace-break-spaces">
					<span class="text-3xl font-bold">{post.title}</span>
				</div>
				<div class="flex flex-col items-right text-right gap-1 font-medium">
					<span class="flex items-center gap-1 md:gap-2 md:justify-end">
						<span class="order-2">{authorFullName}</span>
						<Icon icon="wpf:name" class="w-5 h-5 md:w-6 md:h-6 order-1 md:order-3" />
					</span>
					<div class="flex items-center gap-1 md:gap-2 md:justify-end">
						<span class="order-2">
							{String(post.date.getDate()).padStart(2, '0')}. {String(
								post.date.getMonth() + 1,
							).padStart(2, '0')}. {post.date.getFullYear()}
						</span>
						<Icon icon="mdi:calendar" class="w-5 h-5 md:w-6 md:h-6 order-1 md:order-3" />
					</div>
					<div class="flex items-center gap-1 md:gap-2 md:justify-end">
						<span class="order-2">
							{String(post.date.getHours()).padStart(2, '0')}:{String(
								post.date.getMinutes(),
							).padStart(2, '0')}
						</span>
						<Icon icon="mdi:clock-outline" class="w-5 h-5 md:w-6 md:h-6 order-1 md:order-3" />
					</div>
				</div>
			</div>
		</div>
		<div id="content" class="markdown" class:dark={$darkTheme}>
			{#if post.redirect}
				<div class="flex flex-col items-center justify-center w-full h-12 relative mt-6">
					<div class="absolute bg-gray-200 dark:bg-slate-600 rounded animate-pulse w-full h-12" />
					<span class="text-lg font-bold z-10">Prebieha presmerovanie...</span>
				</div>
			{:else}
				<Markdown md={post.content} plugins={[gfmPlugin, highlightPlugin]} />
			{/if}
		</div>
	{:else}
		<div class="w-full h-12 bg-gray-200 dark:bg-slate-600 rounded animate-pulse relative" />
	{/if}
</div>
