<script lang="ts">
	import type { Item, Day, Header } from '$lib/types'
	import { dayNames, monthNames } from './consts'
	import { calendarData } from '$lib/api/models'
	import { darkTheme } from '$lib/data/prefs'
	import { onMount } from 'svelte'
	import { filterItems, initMonthDays } from '$lib/utils/calendar'
	import clickOutside from '$lib/utils/clickOutside'
	import CalendarEvent from './CalendarEvent.svelte'

	export let showHeader = true
	export let allowExpanding = true
	export let useShortHeaders = true
	export let headers: Header[] = dayNames

	$: usedHeaders = useShortHeaders ? headers.map((h) => h.shortName) : headers.map((h) => h.name)

	let now = new Date()
	export let year = now.getFullYear()
	export let displayedMonth = now.getMonth()

	let items: Item[] = []

	$: days = initMonthDays(displayedMonth, year)
	$: perDayItems = filterItems(days, items)

	$: selectedItems = days
		.map((d, i) => {
			if (!d.selected) return []
			return perDayItems[i]
		})
		.flat()

	let error: string | undefined

	function dayClick(e: Day | undefined) {
		if (!allowExpanding) return

		days.forEach((d) => (d.selected = false))

		if (!e || !e.enabled) return

		const index = days.findIndex((d) => d.date.getTime() === e.date.getTime())
		if (index >= 0) days[index].selected = true
	}

	function deselectAll() {
		days.forEach((d) => (d.selected = false))
		days = days // trigger update
	}

	function parseEvents() {
		const rawEvents = $calendarData[0]?.events

		if (!rawEvents && calendarData.isLoaded) {
			console.error('No events found for inline calendar')
			error = 'Nepodarilo sa spracovať udalosti'
			return
		} else if (!rawEvents) return

		items = rawEvents.map((e) => {
			return {
				title: e.name.short,
				className: e.category.calendarClass,
				date: e.date,
				len: 1,
				id: e.id,
				event: e,
			} as Item
		})
		error = undefined
	}
	$: $calendarData && parseEvents()

	calendarData.onLoadError(() => {
		console.error('Failed to load inline calendar data')
		error = 'Nepodarilo sa načítať udalosti'
	})
	onMount(parseEvents)
</script>

<div
	class="i-calendar-container {$$props.class}"
	class:dark={$darkTheme}
	use:clickOutside={() => deselectAll()}
>
	{#if showHeader}
		<div class="i-calendar-header text-center">
			<h1 class="text-xl flex justify-center items-center">
				{#if displayedMonth > 0}
					<button class="mr-2 text-gray-700 dark:text-gray-200" on:click={() => displayedMonth--}
						>&lt;</button
					>
				{/if}
				<span class="mx-2">
					{monthNames[displayedMonth].name}
					{year}
				</span>
				{#if displayedMonth < 11}
					<button class="ml-2 text-gray-700 dark:text-gray-200" on:click={() => displayedMonth++}
						>&gt;</button
					>
				{/if}
			</h1>
			{#if error}
				<p class="text-red-500 text-sm">{error}</p>
			{/if}
		</div>
	{/if}

	<div class="i-calendar-wrapper">
		<div
			class="i-calendar rounded-b-lg"
			class:dark={$darkTheme}
			style="--rows: {days.length / 7 + 1}"
		>
			{#each usedHeaders as header}
				<span class="i-day-name" class:dark={$darkTheme}>{header}</span>
			{/each}
			{#each days as day, index}
				<div
					class="i-day border-gray-500 dark:border-gray-700"
					class:disabled={!day.enabled}
					class:selected={day.selected}
					class:today={day.today}
					on:click={() => dayClick(day)}
					on:keypress={(e) => (e.key === 'Enter' || e.key === ' ') && dayClick(day)}
				>
					{#if day.name.split(' ').length == 1}
						<span class="i-day-number">{day.name.split(' ')[0]} </span>
					{:else}
						<span class="i-day-month-name" class:ln={day.name.split(' ')[1].length > 1}
							>{day.name.split(' ')[0]}
						</span>
						<span class="i-day-number has-mn" class:ln={day.name.split(' ')[1].length > 1}
							>{day.name.split(' ')[1]}
						</span>
					{/if}
					<div
						class="i-event-indicators"
						style="--indicators: {perDayItems[index].length}; --m-multiple: {perDayItems[index]
							.length == 2
							? 1
							: 0}"
					>
						{#each perDayItems[index] as item}
							<div class="i-indicator-wrapper">
								<div class="i-event-indicator {item.className}" />
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	{#if selectedItems.length > 0}
		<div class="flex flex-row flex-wrap justify-around gap-3 pt-5">
			{#each selectedItems as item}
				<CalendarEvent {item} />
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.i-calendar {
		--day-color: rgba(0, 0, 0, 0);
		--day-color-hover: rgba(0, 0, 0, 0.1);
		--day-selected-color: rgba(136, 255, 0, 0.23);
		--day-today-color: rgba(255, 200, 0, 0.35);
		--day-today-selected-color: rgba(255, 200, 0, 0.7);
		--day-disabled-color: rgba(0, 0, 0, 0.05);

		--day-border-color: rgba(0, 0, 0, 0);

		&.dark {
			--day-color: rgba(255, 255, 255, 0);
			--day-color-hover: rgba(255, 255, 255, 0.1);
			--day-selected-color: rgba(136, 255, 0, 0.3);
			--day-today-color: rgba(255, 200, 0, 0.379);
			--day-today-selected-color: rgba(255, 200, 0, 0.6);
			--day-disabled-color: rgba(255, 255, 255, 0.05);
		}
	}

	.task--warning {
		background: #fdb44d;
	}

	.task--danger {
		background: #fa607e;
	}

	.task--info {
		background: #4786ff;
	}

	.task--success {
		background: #5cb85c;
	}

	.i-calendar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.i-calendar {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 3rem));
		grid-template-rows: 2rem;
		grid-auto-rows: minmax(3rem, 1fr);
		width: 100%;
	}

	.i-day-name {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		padding: 0 0.35rem;
		font-size: 1.1rem;
		font-weight: bold;
	}

	.i-day {
		display: flex;
		flex-direction: column;
		cursor: pointer;
		position: relative;

		height: 3rem;
		hyphens: manual;

		background: var(--day-bg-color);
		transition: background 0.2s ease-in-out;

		&::before {
			content: '';
			display: block;
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			transition: background 0.1s ease-in-out;
		}

		&:hover {
			&::before {
				background: var(--day-color-hover);
			}
		}

		&.today {
			background: var(--day-today-color);
		}

		&.selected {
			background: var(--day-selected-color);
		}

		&.today.selected {
			background: var(--day-today-selected-color);
		}

		&.disabled {
			cursor: not-allowed;
			background: var(--day-disabled-color);

			&:hover {
				&::before {
					background: unset;
				}
			}
		}

		border-right: 1px solid var(--day-border-color);
		border-bottom: 1px solid var(--day-border-color);

		&:nth-child(7n) {
			border-right: none;
		}

		&:nth-last-child(-n + 7) {
			border-bottom: none;
		}

		.i-day-month-name {
			padding: 0.35rem 0 0 0.35rem;
			font-size: 0.8rem;
			position: absolute;

			color: var(--day-month-name-color);

			&.ln {
				padding: 0.45rem 0 0 0.2rem;
				font-size: 0.7rem;
			}
		}

		.i-day-number {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: flex-start;
			padding-top: 0.25rem;

			font-weight: bold;

			color: var(--day-number-color);

			&.has-mn {
				align-items: flex-end;
				padding-right: 0.4rem;

				&.ln {
					padding-right: 0.2rem;
				}
			}
		}

		.i-event-indicators {
			display: grid;
			grid-template-columns: repeat(min(var(--indicators), 3), auto);
			height: 1rem;

			margin: 0 calc(0.5rem * var(--m-multiple));

			.i-indicator-wrapper {
				display: flex;
				justify-content: center;
				align-items: center;

				.i-event-indicator {
					width: 0.5rem;
					height: 0.5rem;
					border-radius: 50%;
				}
			}
		}

		&.disabled {
			.i-day-number {
				font-weight: normal;
			}
		}
	}
</style>
