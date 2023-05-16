<script lang="ts">
	import { postList } from '$lib/posts/posts'
	import { highlightPlugin } from '$lib/prism'
	import Markdown from 'svelte-exmarkdown'
	import { gfmPlugin } from 'svelte-exmarkdown/gfm'

	$: lastPosts = $postList.slice(-10).reverse()
</script>

<h2>Latest Posts</h2>
{#each lastPosts as post}
	<a href="/post/{post.id}" class="border-b border-gray-200 flex py-2 w-full flex-col">
		<div class="flex justify-between">
			<h3 class="text-lg font-semibold">{post.title}</h3>
			<span class="text-sm text-gray-500">{post.date}</span>
		</div>
		<p class="text-gray-500">
			<Markdown
				md={post.content.split('\n').slice(0, 10).join('\n')}
				plugins={[gfmPlugin, highlightPlugin]}
			/>
		</p>
	</a>
{/each}
