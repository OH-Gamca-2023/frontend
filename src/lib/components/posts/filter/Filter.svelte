<script context="module" lang="ts">
	export type FilterResult = {
		categories: number[]
		tags: number[]
		grades: number[]
	}
</script>

<script lang="ts">
	import {
		categories as rawCategories,
		tags as rawTags,
		grades as rawGrades,
	} from '$lib/api/models'
	import Icon from '$lib/components/Icon.svelte'
	import { darkTheme } from '$lib/data/prefs'
	import { slide } from 'svelte/transition'
	import TagComponent from '../tags/Tag.svelte'
	import FilterIcon from './FilterIcon.svelte'

	export let search = true
	export let category = true
	export let tag = true
	export let grade = true

	export let expanded = false

	$: categories = Object.values($rawCategories)

	$: tags = Object.values($rawTags)

	$: grades = Object.values($rawGrades)

	export let filter: FilterResult = {
		categories: [],
		tags: [],
		grades: [],
	}
	export let searchQuery: string = ''

	function toggleSelection(type: 'categories' | 'tags' | 'grades', id: number) {
		filter[type] = filter[type].includes(id)
			? filter[type].filter((e) => e !== id)
			: [...filter[type], id]
	}
</script>

<div class="flex flex-col items-center justify-center w-full">
	{#if search}
		<div class="flex flex-col px-16 w-full md:max-w-2xl relative h-11 mb-4">
			<input
				type="text"
				id="search"
				class="bg-gray-200 dark:bg-slate-800 disabled:bg-gray-400 disabled:dark:bg-gray-500 rounded-md p-2
				flex-1 placeholder-gray-600 dark:placeholder-gray-400 pl-11"
				bind:value={searchQuery}
				placeholder="Vyhľadávanie"
			/>
			<Icon
				icon="material-symbols:search"
				class="absolute h-7 w-7 left-[4.5rem] top-2 rounded-sm dark:text-gray-400 text-gray-600"
			/>
			<button
				class="absolute h-7 w-7 right-[4.5rem] top-2 rounded-sm dark:text-gray-400 text-gray-600"
				on:click={() => (expanded = !expanded)}
			>
				<FilterIcon bind:expanded />
			</button>
		</div>
	{/if}
	{#if expanded || !search}
		<div class="flex flex-row gap-2 mb-4" transition:slide>
			{#if category}
				<div class="flex flex-col gap-1">
					{#each Object.values(categories) as cat}
						<button
							class="filter"
							class:dark={$darkTheme}
							class:selected={filter.categories.includes(cat.id)}
							on:click={() => toggleSelection('categories', cat.id)}
						>
							<TagComponent name={cat.name} styleClass={cat.calendarClass} />
						</button>
					{/each}
				</div>
			{/if}
			{#if tag}
				<div class="flex flex-col gap-1">
					{#each Object.values(tags) as tag}
						<button
							class="filter"
							class:dark={$darkTheme}
							class:selected={filter.tags.includes(tag.id)}
							on:click={() => toggleSelection('tags', tag.id)}
						>
							<TagComponent name={tag.name} />
						</button>
					{/each}
				</div>
			{/if}
			{#if grade}
				<div class="flex flex-col gap-1">
					{#each Object.values(grades).filter((e) => e.competing) as grade}
						<button
							class="filter"
							class:dark={$darkTheme}
							class:selected={filter.grades.includes(grade.id)}
							on:click={() => toggleSelection('grades', grade.id)}
						>
							<TagComponent name={grade.name} />
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.filter {
		transition: all 0.15s ease-in-out;
		cursor: pointer;
		position: relative;

		&:hover {
			transform: scale(1.05);
		}

		&::before {
			content: '';
			position: absolute;
			border-radius: 15rem;
			transition: all 0.15s ease-in-out;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}

		&:not(.selected) {
			&::before {
				background-color: rgba(0, 0, 0, 0.25);
			}

			&:hover::before {
				background-color: rgba(0, 0, 0, 0.2);
			}
		}

		&.dark {
			&:not(.selected) {
				&::before {
					background-color: rgba(0, 0, 0, 0.3);
				}

				&:hover::before {
					background-color: rgba(0, 0, 0, 0.2);
				}
			}
		}
	}
</style>
