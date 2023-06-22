<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { postList } from '$lib/api/models'
	import Filter, { type FilterResult } from '$lib/components/posts/filter/Filter.svelte'
	import Taglist from '$lib/components/posts/tags/Taglist.svelte'
	import type { Post } from '$lib/types'
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
		const url = filterParams || $page.url.href.includes('/news') ? '/news/' + filterParams : '/'
		if (browser) goto(url, { noScroll: true, keepFocus: true, replaceState: true })
	}
</script>

<div class="flex flex-col justify-between items-center w-full">
	<h1 class="text-2xl font-semibold pb-5">Príspevky</h1>

	<Filter bind:filter bind:searchQuery />
</div>

{#each posts as post}
	<a
		href="/post/{post.id}"
		class="border-b border-gray-300 dark:border-gray-500 border-dotted flex py-2 w-full flex-col"
	>
		<div class="flex justify-between">
			<h3 class="text-lg font-semibold">{post.title}</h3>
			<span class="text-sm text-gray-500">{post.date}</span>
		</div>
		<Taglist {post} />
	</a>
{/each}
