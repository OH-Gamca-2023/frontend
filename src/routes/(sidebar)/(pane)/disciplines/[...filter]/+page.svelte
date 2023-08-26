<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { disciplines as rawDisciplines } from '$lib/api/models'
	import Filter, { type FilterResult } from '$lib/components/filter/Filter.svelte'
	import Taglist from '$lib/components/tags/Taglist.svelte'
	import type { Discipline } from '$lib/types'
	import type { PageData } from './$types'

	export let data: PageData

	$: filter = data.filter as FilterResult
	let searchQuery = ''

	let disciplines: Discipline[] = []

	$: {
		let list = Object.values($rawDisciplines)
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

		disciplines = list
	}

	$: {
		const filterParams = Object.entries(filter)
			.filter((e) => e[1].length > 0)
			.map((e) => e.join('/'))
			.join('/')
		const url = '/disciplines' + (filterParams ? '/' + filterParams : '')
		if (browser) goto(url, { noScroll: true, keepFocus: true, replaceState: true })
	}
</script>

<svelte:head>
	<title>Disciplíny &centerdot; OH Gamča 2023</title>
</svelte:head>

<div class="flex flex-col justify-between items-center w-full">
	<h1 class="text-2xl font-semibold pb-5">Disciplíny</h1>

	<Filter tag={false} bind:filter bind:searchQuery />
</div>

{#each disciplines as discipline}
	<a
		href="/discipline/{discipline.id}"
		class="border-b border-gray-300 dark:border-gray-500 border-dotted flex py-2 w-full flex-col"
	>
		<div class="flex justify-between">
			<h3 class="text-lg font-semibold">{discipline.name}</h3>
		</div>
		<Taglist {discipline} />
	</a>
{/each}

{#if disciplines.length === 0}
	<div class="flex py-2 w-full justify-center items-center text-center gap-2">
		<p class="text-lg font-bold">Žiadne disciplíny vyhovujúce filtru neboli nájdené</p>
	</div>
{/if}
