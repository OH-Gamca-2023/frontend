<script lang="ts">
	import { disciplines } from '$lib/api/models'
	import Icon from '../Icon.svelte'
	import type { Item } from '$lib/types/calendar'

	export let item: Item
	$: event = item.event

	$: discipline = $disciplines[item.id]
</script>

<div class="flex flex-col rounded-2xl p-1 event {item.className}">
	<div class="flex text-start header px-2">
		<span class="font-bold" class:text-lg={item.title.length < 15}>{item.title}</span>
	</div>
	<div class="flex flex-col body p-2 rounded-xl">
		<div class="flex justify-between items-center">
			<Icon icon="mdi:calendar" class="h-4 w-4" />
			<span class="text-sm"
				>{String(item.date.getDate()).padStart(2, '0')}.&nbsp;{String(
					item.date.getMonth() + 1,
				).padStart(2, '0')}.&nbsp;{item.date.getFullYear()}</span
			>
		</div>
		{#if event.start_time}
			<div class="flex justify-between items-center">
				<Icon icon="mdi:clock-outline" class="h-4 w-4" />
				<span class="text-sm"
					>{#if event.end_time}
						{event.start_time}&nbsp;-&nbsp;{event.end_time}
					{:else}
						{event.start_time}
					{/if}
				</span>
			</div>
		{/if}
		{#if event.location}
			<div class="flex justify-between items-center">
				<Icon icon="mdi:map-marker" class="h-4 w-4" />
				<span class="text-sm">{event.location}</span>
			</div>
		{/if}
		{#if discipline && (discipline.details_published || discipline.results_published)}
			<div class="flex justify-between items-center">
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
		color: hsl(36, 95%, 95%);

		.body {
			color: #e69423;
			background: #fef0db;
		}
	}

	.task--danger {
		background: #f8254e;
		color: hsl(347, 100%, 95%);

		.body {
			color: #fa607e;
			background: #ffd4dd;
		}
	}

	.task--info {
		background: #0a5eff;
		color: hsl(220, 100%, 95%);

		.body {
			color: #4786ff;
			background: #dbe7ff;
		}
	}

	.task--success {
		background: #4d9b4d;
		color: hsl(120, 100%, 95%);

		.body {
			color: #3c763d;
			background: #ccffcc;
		}
	}
</style>
