<script lang="ts">
	import CalendarDisplay from './CalendarDisplay.svelte'
	import { createEventDispatcher, onMount } from 'svelte'
	import type { Header, Item, Day } from './types'
	import { dayNames, monthNames } from './consts'

	let now = new Date()
	let year = now.getFullYear()
	let month = now.getMonth()
	let eventText = 'Click an item or date'

	let days: Day[] = []

	let items: Item[] = []

	function initMonthItems() {}

	$: month, year, initContent()

	// choose what date/day gets displayed in each date box.
	function initContent() {
		initMonth()
		initMonthItems()
	}

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
			days.push({ name, enabled: true, date: d })
		}

		//	show any days to fill up the last row (disabled) - always less than 7
		for (let i = 0; days.length % 7; i++) {
			let d = new Date(month == 11 ? year + 1 : year, (month + 1) % 12, i + 1)
			let name = (i == 0 ? monthNames[nextMonth].shortName + ' ' : '') + (i + 1)
			days.push({ name, enabled: false, date: d })
		}
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

	function itemClick(e: any) {
		eventText = 'itemClick ' + JSON.stringify(e) + ' localtime=' + e.date.toString()
	}
	function dayClick(e: any) {
		eventText = 'onDayClick ' + JSON.stringify(e) + ' localtime=' + e.date.toString()
	}
	function headerClick(e: any) {
		eventText = 'onHheaderClick ' + JSON.stringify(e)
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

<div class="calendar-container">
	<div class="calendar-header">
		<h1>
			<button on:click={() => prev()}>&lt;</button>
			<span class="mx-2">
				{monthNames[month].name}
				{year}
			</span>
			<button on:click={() => next()}>&gt;</button>
		</h1>
		{eventText}
	</div>

	<CalendarDisplay
		{days}
		{items}
		on:dayClick={(e) => dayClick(e.detail)}
		on:itemClick={(e) => itemClick(e.detail)}
		on:headerClick={(e) => headerClick(e.detail)}
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
		max-width: 1200px;
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
