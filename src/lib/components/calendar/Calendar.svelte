<script lang="ts">
	import CalendarDisplay from './CalendarDisplay.svelte'
	import type { Item, Day, Header } from './types'
	import { dayNames, monthNames } from './consts'
	import { calendarData } from './data'
	import { darkTheme } from '$lib/data/prefs'
	import { onMount } from 'svelte'
	import { compareDates } from './utils'

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

	function initMonthDays(month: number, year: number) {
		days[month] = []
		let monthAbbrev = monthNames[month].shortName

		let firstDay = new Date(year, month, 1).getDay() - 1 // 0 - 6

		let daysInThisMonth = new Date(year, month + 1, 0).getDate() // 28 - 31
		let daysInLastMonth = new Date(year, month, 0).getDate() // 28 - 31

		let prevMonth = (month + 11) % 12
		let nextMonth = (month + 1) % 12

		//	show the days before the start of this month (disabled) - always less than 7
		for (let i = daysInLastMonth - firstDay; i < daysInLastMonth; i++) {
			let d = new Date(prevMonth == 11 ? year - 1 : year, prevMonth, i + 1)
			let name =
				(i == daysInLastMonth - firstDay ? monthNames[prevMonth].shortName + ' ' : '') + (i + 1)
			days[month].push({ name, enabled: false, date: d })
		}

		//	show the days in this month (enabled) - always 28 - 31
		for (let i = 0; i < daysInThisMonth; i++) {
			let d = new Date(year, month, i + 1)
			let name = (i == 0 ? monthAbbrev + ' ' : '') + (i + 1)
			days[month].push({
				name,
				enabled: true,
				date: d,
				today: i == now.getDate() - 1 && month == now.getMonth(),
			})
		}

		//	show any days to fill up the last row (disabled) - always less than 7
		for (let i = 0; days[month].length % 7; i++) {
			let d = new Date(month == 11 ? year + 1 : year, (month + 1) % 12, i + 1)
			let name = (i == 0 ? monthNames[nextMonth].shortName + ' ' : '') + (i + 1)
			days[month].push({ name, enabled: false, date: d })
		}
	}

	function initDays(year: number) {
		days = [[], [], [], [], [], [], [], [], [], [], [], []]

		for (let i = 0; i < 12; i++) {
			initMonthDays(i, year)
		}
	}

	function itemClick(e: Item, month: number) {
		if (!allowExpanding) return

		const currItemID = e.id

		let day = days[month].find((d) => compareDates(d.date, e.date))
		dayClick(day, month)

		items.forEach((i) => (i.selected = false))
		const index = items.findIndex((i) => i.id == currItemID)
		if (index >= 0) items[index].selected = true
	}

	function dayClick(e: Day | undefined, month: number) {
		if (!allowExpanding) return

		days.forEach((m) => m.forEach((d) => (d.selected = false)))

		if (!e || !e.enabled) return

		const index = days[month].findIndex((d) => d.date.getTime() === e.date.getTime())
		if (index >= 0) days[month][index].selected = true

		// unselect all items that are not in this day
		items.forEach((i) => {
			if (!compareDates(i.date, e.date)) i.selected = false
		})
		items = items
	}

	function deselectAll(clickedMonth: number | undefined) {
		if (clickedMonth != displayedMonth && clickedMonth != undefined) return

		days.forEach((m) => m.forEach((d) => (d.selected = false)))
		items.forEach((i) => (i.selected = false))
		;(days = days), (items = items) // trigger update
	}

	calendarData.onUpdated(() => {
		const rawEvents = calendarData.get(0)!.events
		items = rawEvents.map((e) => {
			return {
				title: e.name.short,
				className: e.category.calendarClass,
				date: e.date,
				len: 1,
				id: e.id,
			} as Item
		})
	})

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
