<script lang="ts">
	import { disciplines } from '$lib/posts/disciplines'
	import Icon from '../Icon.svelte'
	import type { Item } from './types'

	export let item: Item
	$: event = item.event

	$: discipline = $disciplines[item.id]
</script>

<div class="flex flex-col rounded-2xl p-1 event {item.className}">
	<div class="flex flex-row justify-start items-center header pl-2">
		<span class="text-lg font-bold">{item.title}</span>
	</div>
	<div class="flex flex-col body p-2 rounded-xl">
		<div class="flex flex-row justify-between items-center">
			<Icon icon="mdi:calendar" class="h-4 w-4" />
			<span class="text-sm"
				>{String(item.date.getDate()).padStart(2, '0')}.&nbsp;{String(
					item.date.getMonth() + 1,
				).padStart(2, '0')}.&nbsp;{item.date.getFullYear()}</span
			>
		</div>
		{#if event.time}
			<div class="flex flex-row justify-between items-center">
				<Icon icon="mdi:clock-outline" class="h-4 w-4" />
				<span class="text-sm">{event.time}</span>
			</div>
		{/if}
		{#if event.location}
			<div class="flex flex-row justify-between items-center">
				<Icon icon="mdi:map-marker" class="h-4 w-4" />
				<span class="text-sm">{event.location}</span>
			</div>
		{/if}
		{#if discipline && (discipline.details_published || discipline.results_published)}
			<div class="flex flex-row justify-between items-center">
				<Icon icon="mdi:book-open-page-variant" class="mr-5" />
				<a
					href={`/discipline/${discipline.id}`}
					class="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
					>Viac informácií</a
				>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.task--warning {
		background-color: #fc9b10;
		color: #fef0db;

		.body {
			color: #e69423;
			background: #fef0db;
		}
	}

	.task--danger {
		background: #f8254e;

		.body {
			color: #fa607e;
			background: #ffd4dd;
		}
	}

	.task--info {
		background: #0a5eff;

		.body {
			color: #4786ff;
			background: #dbe7ff;
		}
	}

	.task--success {
		background: #4d9b4d;

		.body {
			color: #3c763d;
			background: #ccffcc;
		}
	}
</style>
