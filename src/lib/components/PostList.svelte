<script lang="ts">
	import { postList } from '$lib/posts/posts'

	$: lastPosts = $postList.slice(-10).reverse()
</script>

<h2>Latest Posts</h2>
{#each lastPosts as post}
	<a href="/post/{post.id}" class="border-b border-gray-200 flex py-2 w-full flex-col">
		<div class="flex justify-between">
			<h3 class="text-lg font-semibold">{post.title}</h3>
			<span class="text-sm text-gray-500">{post.date}</span>
		</div>
		<p class="text-gray-500">{post.content}</p>
	</a>
{/each}
