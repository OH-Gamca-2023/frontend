<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { postList } from '$lib/api/models'
	import Filter, { type FilterResult } from '$lib/components/posts/filter/Filter.svelte'
	import Taglist from '$lib/components/posts/tags/Taglist.svelte'
	import { highlightPlugin } from '$lib/prism'
	import type { Post } from '$lib/types'
	import Markdown from 'svelte-exmarkdown'
	import { gfmPlugin } from 'svelte-exmarkdown/gfm'
	import type { PageData } from './$types'
	import { page } from '$app/stores'

	export let data: PageData

	let filter: FilterResult = data.filter
	let searchQuery: string = ''

	let posts: Post[] = []

	$: {
		let list = $postList
		if (list) {
			if (filter.categories.length > 0) {
				list = list.filter(
					(e) => e?.discipline_categories.some((e) => filter.categories.includes(e?.id)) ?? false,
				)
			}

			if (filter.tags.length > 0) {
				list = list.filter((e) =>
					filter.tags.every((f) => e?.tags.map((e) => e.id).includes(f) ?? false),
				)
			}

			if (filter.grades.length > 0) {
				list = list.filter((e) =>
					filter.grades.some((f) => e?.affected_grades.map((e) => e.id).includes(f) ?? false),
				)
			}

			if (searchQuery) {
				list = list.filter(
					(e) =>
						e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						(e.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
				)
			}
		}

		posts = list
	}

	$: {
		const filterParams = Object.entries(filter)
			.filter((e) => e[1].length > 0)
			.map((e) => e.join('/'))
			.join('/')
		const url = filterParams ? '/news/' + filterParams : $page.url.href == '' ? '/' : '/news/'
		if (browser) goto(url, { noScroll: true, keepFocus: true, replaceState: true })
	}
</script>

<h2>Latest Posts</h2>

<Filter bind:filter bind:searchQuery />

{#each posts as post}
	<a href="/post/{post.id}" class="border-b border-gray-200 flex py-2 w-full flex-col">
		<div class="flex justify-between">
			<h3 class="text-lg font-semibold">{post.title}</h3>
			<span class="text-sm text-gray-500">{post.date}</span>
		</div>
		<Taglist {post} />
		<p class="text-gray-500 max-h-20 overflow-hidden">
			<Markdown
				md={post.content?.split('\n').slice(0, 10).join('\n') ?? ''}
				plugins={[gfmPlugin, highlightPlugin]}
			/>
		</p>
	</a>
{/each}
