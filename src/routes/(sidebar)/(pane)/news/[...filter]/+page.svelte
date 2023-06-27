<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { postList } from '$lib/api/models'
	import Filter, { type FilterResult } from '$lib/components/filter/Filter.svelte'
	import Taglist from '$lib/components/tags/Taglist.svelte'
	import type { Post } from '$lib/types'
	import type { PageData } from './$types'
	import Icon from '$lib/components/Icon.svelte'
	import { page } from '$app/stores'

	export let data: PageData

	$: filter = data.filter as FilterResult
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
		href={post.redirect ? post.redirect : '/post/' + post.id}
		class="border-b border-gray-300 dark:border-gray-500 border-dotted flex py-2 w-full flex-row"
	>
		<div class="flex flex-col justify-between flex-1 items-left">
			<h3 class="text-lg font-bold">{post.title}</h3>
			<Taglist {post} />
		</div>
		<div class="flex flex-col items-right text-right gap-1 font-medium text-sm">
			<div class="flex items-center gap-2 justify-end">
				<span>
					{String(post.date.getDate()).padStart(2, '0')}. {String(
						post.date.getMonth() + 1,
					).padStart(2, '0')}.
					{String(post.date.getHours()).padStart(2, '0')}:{String(post.date.getMinutes()).padStart(
						2,
						'0',
					)}
				</span>
				<Icon icon="formkit:datetime" class="w-4 h-4" />
			</div>
			<div class="flex items-center gap-2 justify-end">
				<span>
					{post.author.username}
				</span>
				<Icon icon="wpf:name" class="w-4 h-4" />
			</div>
		</div>
	</a>
{/each}

{#if posts.length === 0}
	<div class="flex py-2 w-full flex-row justify-center items-center text-center gap-2">
		<p class="text-lg font-bold">Žiadne príspevky vyhovujúce filtru neboli nájdené</p>
	</div>
{/if}
