<script lang="ts">
	import { disciplines } from '$lib/posts/disciplines'
	import { darkTheme } from '$lib/data/prefs'
	import { posts } from '$lib/posts/posts'
	import { highlightPlugin } from '$lib/prism'
	import Markdown from 'svelte-exmarkdown'
	import { gfmPlugin } from 'svelte-exmarkdown/gfm'

	export let id: string

	$: discipline = $disciplines[id]

	if (!discipline) disciplines.loadSingle(id)

	let view = 'overview' as 'overview' | 'people' | 'results'
</script>

<svelte:head>
	<link rel="stylesheet" href="/markdown-dark.css" />
	<link rel="stylesheet" href="/markdown-light.css" />
</svelte:head>

<div class="w-full flex flex-col">
	{#if discipline}
		<div class="flex flex-row justify-center items-center">
			<div class="flex flex-col">
				<span class="text-2xl font-bold">{discipline.name}</span>
				<div class="flex flex-row">
					{#if discipline.category}
						<div class="ampule {discipline.category.calendarClass}" class:dark={$darkTheme}>
							<span class="text-sm font-bold">{discipline.category.name}</span>
						</div>
					{:else}
						<div class="task--danger ampule" class:dark={$darkTheme}>
							<span class="text-sm font-bold">Chyba</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="w-full h-12 bg-gray-200 dark:bg-slate-600 rounded animate-pulse relative" />
	{/if}
</div>

<style lang="scss">
	.ampule {
		height: 2rem;
		border: 2px solid;
		padding: 3px;
		border-radius: 2rem;

		&.task--warning {
			border-color: #fdb44d;
			&::before {
				background: #fef0db;
			}
			color: #fc9b10;
		}

		&.task--danger {
			border-color: #fa607e;
			&::before {
				background: #ffd4dd;
			}
			color: #f8254e;
		}

		&.task--info {
			border-color: #4786ff;
			&::before {
				background: #dbe7ff;
			}
			color: #0a5eff;
		}

		&.task--success {
			border-color: #5cb85c;

			&::before {
				background: #ccffcc;
			}
			color: #3c763d;
		}
	}
</style>
