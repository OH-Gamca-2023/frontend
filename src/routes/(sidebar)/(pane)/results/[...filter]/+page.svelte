<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { disciplines as rawDisciplines } from '$lib/api/models'
	import Icon from '$lib/components/Icon.svelte'
	import Filter, { type FilterResult } from '$lib/components/filter/Filter.svelte'
	import Taglist from '$lib/components/tags/Taglist.svelte'
	import type { Discipline } from '$lib/types'
	import type { PageData } from './$types'

	export let data: PageData

	$: filter = data.filter as FilterResult
	let searchQuery = ''

	let disciplines: Discipline[] = []

	let entriesPerPage = 10
	let pageNum = 0
	let maxPage = 0

	$: {
		let list = Object.values($rawDisciplines).filter((e) => e.results_published)
		if (list) {
			if (filter.categories.length > 0) {
				list = list.filter((e) => filter.categories.includes(e?.category?.id) ?? false)
			}

			if (filter.grades.length > 0) {
				list = list.filter((e) =>
					filter.grades.every((f) => e?.target_grades.map((e) => e.id).includes(f) ?? false),
				)
			}
		}

		if (searchQuery) {
			list = list.filter(
				(e) =>
					e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(e.short_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
			)
		}

		list.sort((a, b) => {
			if (!a.date && !b.date) return 0
			if (!a.date) return 1
			if (!b.date) return -1

			if (a.date.getTime() !== b.date.getTime()) return b.date.getTime() - a.date.getTime()

			if (a.start_time && !b.start_time) return -1
			if (!a.start_time && b.start_time) return 1
			if (a.start_time && b.start_time) return b.start_time.getTime() - a.start_time.getTime()

			return 0
		})

		maxPage = Math.ceil(list.length / entriesPerPage) - 1
		pageNum = Math.min(maxPage, Math.max(0, pageNum))

		disciplines = list.slice(pageNum * entriesPerPage, (pageNum + 1) * entriesPerPage)
	}

	$: {
		const filterParams = Object.entries(filter)
			.filter((e) => e[1].length > 0)
			.map((e) => e.join('/'))
			.join('/')
		const url = '/results' + (filterParams ? '/' + filterParams : '')
		if (browser) goto(url, { noScroll: true, keepFocus: true, replaceState: true })
	}
</script>

<svelte:head>
	<title>Výsledky &centerdot; OH Gamča 2023</title>
</svelte:head>

<div class="flex flex-col justify-between items-center w-full">
	<h1 class="text-2xl font-semibold pb-5">Výsledky disciplín</h1>

	<Filter tag={false} bind:filter bind:searchQuery />
</div>

{#each disciplines as discipline}
	<a
		href="/discipline/{discipline.id}/results"
		class="border-b border-neutral-400 dark:border-neutral-500 border-dotted flex py-2 w-full flex-col"
	>
		<div class="flex justify-between">
			<h3 class="text-lg font-semibold">{discipline.name}</h3>
		</div>
		<Taglist {discipline} />
	</a>
{/each}

{#if disciplines.length === 0}
	<div class="flex py-2 w-full justify-center items-center text-center gap-2">
		<p class="text-lg font-bold">Žiadne výsledky vyhovujúce filtru neboli nájdené</p>
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
