<script lang="ts">
	import CalendarDisplay from './CalendarDisplay.svelte'
	import type { Item, Day, Header } from '$lib/types'
	import { dayNames, monthNames } from './consts'
	import { calendarData } from '$lib/api/models'
	import { darkTheme } from '$lib/data/prefs'
	import { onMount } from 'svelte'
	import { compareDates, initMonthDays } from '$lib/utils/calendar'
	import { toast } from '$lib/utils/toasts'

	export let showHeader = true
	export let allowExpanding = true
	export let useShortHeaders = false
	export let headers: Header[] = dayNames

	$: usedHeaders = useShortHeaders ? headers.map((h) => h.shortName) : headers.map((h) => h.name)

	let now = new Date()
	export let year = now.getFullYear()
	export let displayedMonth = now.getMonth()

	let days: Day[][] = []
	let items: Item[] = []

	let selected = {
		items: [] as string[],
		days: [] as string[],
	}

	let error: string | undefined

	function initDays(year: number) {
		days = [[], [], [], [], [], [], [], [], [], [], [], []]

		for (let i = 0; i < 12; i++) {
			days[i] = initMonthDays(i, year)
		}
	}

	function itemClick(e: Item, month: number) {
		if (!allowExpanding) return

		const currItemID = e.id

		let day = days[month].find((d) => compareDates(d.date, e.date))
		dayClick(day, month)

		selected.items = [currItemID]
	}

	function dayClick(e: Day | undefined, month: number) {
		if (!allowExpanding) return

		selected.days = []

		if (!e || !e.enabled) return

		selected.days = [e.id]

		// unselect all items that are not in this day
		selected.items = selected.items.filter((i) => {
			const item = items.find((it) => it.id === i)
			if (!item) return false

			return compareDates(item.date, e.date)
		})
	}

	function deselectAll(clickedMonth: number | undefined) {
		if (clickedMonth != displayedMonth && clickedMonth != undefined) return

		selected.days = []
		selected.items = []
	}

	function parseEvents() {
		const rawEvents = $calendarData[0]?.events

		if (!rawEvents && calendarData.isLoaded) {
			console.error('No events found')
			toast({ type: 'error', title: 'Nepodarilo sa spracovať udalosti', duration: 7500 })
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
	$: displayedMonth && deselectAll(undefined)

	calendarData.onLoadError(() => {
		console.error('Failed to load calendar data')
		toast({ type: 'error', title: 'Nepodarilo sa načítať udalosti', duration: 7500 })
		error = 'Nepodarilo sa načítať udalosti'
	})

	onMount(parseEvents)

	initDays(year)
</script>

<div class="calendar-container {$$props.class} rounded-lg shadow-lg w-full" class:dark={$darkTheme}>
	{#if showHeader}
		<div class="calendar-header rounded-t-lg bg-violet-100 py-5 px-0 text-center">
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

	<div
		class="calendars rounded-b-lg"
		style="--curr-rows: {(days[displayedMonth]?.length ?? 0) / 7}"
	>
		<div class="calendar-grid" class:dark={$darkTheme}>
			{#each usedHeaders as header}
				<span class="day-name" class:dark={$darkTheme}>{header}</span>
			{/each}
			{#each Array.from({ length: 12 }) as _, i}
				<div
					class="calendar-wrapper"
					class:active={displayedMonth == i}
					style="--current-month: {displayedMonth}; --index: {i}; --rows: {(days[i]?.length ?? 0) /
						7}"
				>
					<CalendarDisplay
						days={days[i] ?? []}
						{items}
						{usedHeaders}
						{selected}
						on:dayClick={(e) => dayClick(e.detail, i)}
						on:itemClick={(e) => itemClick(e.detail, i)}
						on:clickOutside={() => deselectAll(i)}
					/>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.calendar-container {
		background-color: white;
		max-width: calc(200px * 7 + 2rem);

		&.dark {
			background-color: #374151;
			.calendar-header {
				background-color: #2b3544;
			}
		}
	}

	.calendars {
		position: relative;
		width: 100%;
		overflow: hidden;
		height: calc(150px * var(--curr-rows) + 50px);
		transition: height 0.5s ease-in-out;

		.calendar-wrapper {
			position: absolute;
			top: 50px;
			width: 100%;
			height: calc(150px * var(--rows));

			grid-row: 2/7;
			grid-column: 1/8;

			$diff: calc(var(--index) - var(--current-month));
			left: calc(100% * $diff);
			transition: left 0.5s ease-in-out;

			overflow-x: hidden;
			overflow-y: visible;

			&.active {
				top: 0;
				position: relative;
				opacity: 1;
			}

			@media (max-width: 1100px) {
				top: 0;
				height: calc(150px * var(--rows) + 50px);

				&.active {
					top: -50px;
				}
			}
		}

		.calendar-grid {
			display: grid;
			width: 100%;
			grid-template-columns: repeat(7, 1fr);
			grid-template-rows: 50px;
			grid-auto-rows: 120px;
		}
	}

	.day-name {
		color: #e9a1a7;
		border-bottom: 1px solid rgba(166, 168, 179, 0.12);
		background-color: white;

		font-size: 12px;
		text-transform: uppercase;
		text-align: center;
		line-height: 50px;
		font-weight: 500;

		&.dark {
			background-color: #374151;
			color: #f36974;
		}

		@media (max-width: 1100px) {
			display: none;
		}

		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
</style>
