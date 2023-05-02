<script lang="ts">
	import CalendarDisplay from './CalendarDisplay.svelte'
	import type { Item, Day } from './types'
	import { monthNames } from './consts'
	import { calendarData } from './data'

	export let showHeader = true
	export let allowExpanding = true

	let now = new Date()
	export let year = now.getFullYear()
	export let month = now.getMonth()

	let days: Day[] = []

	let allItems: Item[] = []
	let currentItems: Item[] = []

	function initMonth() {
		days = []
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
			days.push({ name, enabled: false, date: d })
		}

		//	show the days in this month (enabled) - always 28 - 31
		for (let i = 0; i < daysInThisMonth; i++) {
			let d = new Date(year, month, i + 1)
			let name = (i == 0 ? monthAbbrev + ' ' : '') + (i + 1)
			days.push({ name, enabled: true, date: d, today: i == now.getDate() - 1 })
		}

		//	show any days to fill up the last row (disabled) - always less than 7
		for (let i = 0; days.length % 7; i++) {
			let d = new Date(month == 11 ? year + 1 : year, (month + 1) % 12, i + 1)
			let name = (i == 0 ? monthNames[nextMonth].shortName + ' ' : '') + (i + 1)
			days.push({ name, enabled: false, date: d })
		}
	}

	function initMonthItems() {
		currentItems = []

		for (let i of allItems) {
			let rc = findRowCol(i.date)
			if (rc) {
				i.startRow = rc.row
				i.startCol = rc.col
				i.enabled = days[(rc.row - 2) * 7 + rc.col - 1]?.enabled ?? true
				i.selected = false
				currentItems.push(i)
			} else {
				i.startRow = i.startCol = 0
			}
		}
	}

	$: month, year, initContent()
	calendarData.onLoaded(() => {
		const rawEvents = calendarData.get(0)!.events
		allItems = rawEvents.map((e) => {
			return {
				title: e.name,
				className: e.category.calendarClass,
				date: e.date,
				len: 1,
				id: e.id,
			} as Item
		})

		initContent()
	})

	function initContent() {
		initMonth()
		initMonthItems()
	}

	function findRowCol(dt: Date): { row: number; col: number } | null {
		for (let i = 0; i < days.length; i++) {
			let d = days[i].date
			if (
				d.getFullYear() === dt.getFullYear() &&
				d.getMonth() === dt.getMonth() &&
				d.getDate() === dt.getDate()
			)
				return { row: Math.floor(i / 7) + 2, col: (i % 7) + 1 }
		}
		return null
	}

	function itemClick(e: Item) {
		if (!allowExpanding) return

		const currItemID = e.id

		if (!e.enabled) {
			month = e.date.getMonth()
			year = e.date.getFullYear()
			initContent()
		}

		setTimeout(() => {
			let day = days.find(
				(d) => d.date.getDate() === e.date.getDate() && d.date.getMonth() === e.date.getMonth(),
			)
			dayClick(day)

			currentItems.forEach((i) => (i.selected = false))
			const index = currentItems.findIndex((i) => i.id == currItemID)
			if (index >= 0) currentItems[index].selected = true
		}, 0) // Only select the item after the calendar has been updated
	}

	function dayClick(e: Day | undefined) {
		if (!allowExpanding) return

		days.forEach((d) => (d.selected = false))

		if (!e || !e.enabled) return

		const index = days.findIndex((d) => d.date.getTime() === e.date.getTime())
		if (index >= 0) days[index].selected = true
	}

	function next() {
		month++
		if (month == 12) {
			year++
			month = 0
		}
	}

	function prev() {
		month--
		if (month == -1) {
			year--
			month = 11
		}
	}
</script>

<div class="calendar-container {$$props.class}">
	{#if showHeader}
		<div class="calendar-header">
			<h1>
				<button on:click={() => prev()}>&lt;</button>
				<span class="mx-2">
					{monthNames[month].name}
					{year}
				</span>
				<button on:click={() => next()}>&gt;</button>
			</h1>
		</div>
	{/if}

	<CalendarDisplay
		{days}
		items={currentItems}
		on:dayClick={(e) => dayClick(e.detail)}
		on:itemClick={(e) => itemClick(e.detail)}
		on:clickOutside={() => (days.forEach((d) => (d.selected = false)), (days = days))}
	/>
</div>

<style>
	.calendar-container {
		width: 90%;
		margin: auto;
		overflow: hidden;
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		background: #fff;
	}
	.calendar-header {
		text-align: center;
		padding: 20px 0;
		background: #eef;
		border-bottom: 1px solid rgba(166, 168, 179, 0.12);
	}
	.calendar-header h1 {
		margin: 0;
		font-size: 18px;
	}
	.calendar-header button {
		background: #eef;
		border: 1px;
		padding: 6;
		color: rgba(81, 86, 93, 0.7);
		cursor: pointer;
		outline: 0;
	}
</style>
