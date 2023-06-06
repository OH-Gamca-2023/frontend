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

<div class="w-full flex flex-col">
	{#if discipline}
		<div class="flex flex-row justify-center items-center">
			<div class="flex flex-col">
				<span class="text-2xl font-bold">{discipline.name}</span>
				<div class="flex flex-row pt-2 justify-center space-y-3">
					{#if discipline.category}
						<div class="ampule {discipline.category.calendarClass}" class:dark={$darkTheme}>
							<span class="dot" />
							<span class="text-sm font-bold">{discipline.category.name}</span>
						</div>
					{:else}
						<div class="ampule" class:dark={$darkTheme}>
							<span class="dot" />
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
		height: 1.5rem;
		padding: 5px 8px 5px 5px;
		border-radius: 15rem;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		background: hsl(0, 0%, 84%);
		color: hsl(0, 0%, 31%);

		.dot {
			width: 12px;
			height: 12px;
			margin: 0px 4px 0px 3px;
			border-radius: 50%;

			background: hsl(0, 0%, 13%);
		}

		&.task--warning {
			background: hsl(35, 98%, 90%);
			.dot {
				background: hsl(35, 95%, 53%);
			}
			color: hsl(35, 98%, 40%);
		}

		&.task--danger {
			background: hsl(348, 98%, 90%);
			.dot {
				background: hsl(348, 95%, 53%);
			}
			color: hsl(348, 98%, 40%);
		}

		&.task--info {
			background: hsl(220, 98%, 90%);
			.dot {
				background: hsl(220, 95%, 53%);
			}
			color: hsl(220, 98%, 40%);
		}

		&.task--success {
			background: hsl(120, 70%, 90%);
			.dot {
				background: hsl(120, 70%, 53%);
			}
			color: hsl(120, 70%, 40%);
		}
	}
</style>
