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
	let searchQuery = ''

	let entriesPerPage = 10
	let pageNum = 0
	let maxPage = 0

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

		maxPage = Math.ceil(list.length / entriesPerPage) - 1
		pageNum = Math.min(maxPage, Math.max(0, pageNum))

		posts = list.slice(pageNum * entriesPerPage, (pageNum + 1) * entriesPerPage)
	}

	$: {
		const filterParams = Object.entries(filter)
			.filter((e) => e[1].length > 0)
			.map((e) => e.join('/'))
			.join('/')
		let url = filterParams || $page.url.href.includes('/news') ? '/news/' + filterParams : '/'
		if (browser) goto(url, { noScroll: true, keepFocus: true, replaceState: true })
	}
</script>

<svelte:head>
	<title>Novinky &centerdot; OH Gamča 2023</title>
</svelte:head>

<div class="flex flex-col justify-between items-center w-full">
	<h1 class="text-2xl font-semibold pb-5">Príspevky</h1>

	<Filter bind:filter bind:searchQuery />
</div>

{#each posts as post}
	<a
		href={post.redirect ? post.redirect : '/post/' + post.id}
		class="border-b border-neutral-400 dark:border-neutral-500 border-dotted flex flex-col py-2 w-full"
	>
		<div class="flex justify-between gap-4">
			<h3 class="md:text-lg font-bold">{post.title}</h3>
			<div class="flex flex-col items-right text-right gap-1 font-medium text-sm">
				<div class="flex items-center gap-2 justify-end">
					<span>
						{String(post.date.getDate()).padStart(2, '0')}. {String(
							post.date.getMonth() + 1,
						).padStart(2, '0')}.
						{String(post.date.getHours()).padStart(2, '0')}:{String(
							post.date.getMinutes(),
						).padStart(2, '0')}
					</span>
					<Icon icon="mdi:calendar-clock" class="w-5 h-5" />
				</div>
				<div class="flex items-center gap-2 justify-end">
					<span>
						{post.author.username}
					</span>
					<Icon icon="mdi:account" class="w-5 h-5" />
				</div>
			</div>
		</div>
		<Taglist {post} />
	</a>
{/each}

{#if posts.length === 0}
	<div class="flex py-2 w-full justify-center items-center text-center gap-2">
		<p class="text-lg font-bold">Žiadne príspevky vyhovujúce filtru neboli nájdené</p>
	</div>
{/if}

<div
	class="flex flex-col rounded-md shadow-md mt-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
>
	<div class="flex">
		<button
			class="flex items-center justify-center w-10 h-10 cursor-pointer
			rounded-tl-md hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:text-neutral-400
			disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed"
			disabled={pageNum === 0}
			on:click={() => (pageNum -= 1)}
		>
			<Icon icon="mdi:chevron-left" class="w-5 h-5" />
		</button>
		<div
			class="flex items-center justify-center w-10 h-10 bg-neutral-200 dark:bg-neutral-800 cursor-default"
		>
			{pageNum + 1}
		</div>
		<button
			class="flex items-center justify-center w-10 h-10 cursor-pointer
			rounded-tr-md hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:text-neutral-300
			disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed"
			disabled={pageNum === maxPage}
			on:click={() => (pageNum += 1)}
		>
			<Icon icon="mdi:chevron-right" class="w-5 h-5" />
		</button>
	</div>
	<div class="flex">
		<button
			class="flex items-center justify-center w-10 h-10 cursor-pointer
			rounded-bl-md hover:bg-neutral-300 dark:hover:bg-neutral-700
			disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed"
			disabled={entriesPerPage === 5}
			on:click={() => (entriesPerPage = 5)}
		>
			5
		</button>
		<button
			class="flex items-center justify-center w-10 h-10 cursor-pointer
			hover:bg-neutral-300 dark:hover:bg-neutral-700
			disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed"
			disabled={entriesPerPage === 10}
			on:click={() => (entriesPerPage = 10)}
		>
			10
		</button>
		<button
			class="flex items-center justify-center w-10 h-10 cursor-pointer
			rounded-br-md hover:bg-neutral-300 dark:hover:bg-neutral-700
			disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed"
			disabled={entriesPerPage === 20}
			on:click={() => (entriesPerPage = 20)}
		>
			20
		</button>
	</div>
</div>

<style lang="scss">
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
