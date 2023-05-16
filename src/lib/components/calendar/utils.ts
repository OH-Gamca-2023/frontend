import { monthNames } from './consts'
import type { Day, Item } from './types'

export function compareDates(a: Date, b: Date): boolean {
	// check if the dates are in the same month and are the same day
	return a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function initMonthDays(month: number, year: number) {
	const now = new Date()
	const days = [] as Day[]
	const monthAbbrev = monthNames[month].shortName

	const firstDay = (new Date(year, month, 1).getDay() + 6) % 7 // 0 - 6

	const daysInThisMonth = new Date(year, month + 1, 0).getDate() // 28 - 31
	const daysInLastMonth = new Date(year, month, 0).getDate() // 28 - 31

	const prevMonth = (month + 11) % 12
	const nextMonth = (month + 1) % 12

	//	show the days before the start of this month (disabled) - always less than 7
	for (let i = daysInLastMonth - firstDay; i < daysInLastMonth; i++) {
		const d = new Date(prevMonth == 11 ? year - 1 : year, prevMonth, i + 1)
		const name =
			(i == daysInLastMonth - firstDay ? monthNames[prevMonth].shortName + ' ' : '') + (i + 1)
		days.push({ name, enabled: false, date: d })
	}

	//	show the days in this month (enabled) - always 28 - 31
	for (let i = 0; i < daysInThisMonth; i++) {
		const d = new Date(year, month, i + 1)
		const name = (i == 0 ? monthAbbrev + ' ' : '') + (i + 1)
		days.push({
			name,
			enabled: true,
			date: d,
			today: i == now.getDate() - 1 && month == now.getMonth(),
		})
	}

	//	show any days to fill up the last row (disabled) - always less than 7
	for (let i = 0; days.length % 7; i++) {
		const d = new Date(month == 11 ? year + 1 : year, (month + 1) % 12, i + 1)
		const name = (i == 0 ? monthNames[nextMonth].shortName + ' ' : '') + (i + 1)
		days.push({ name, enabled: false, date: d })
	}

	return days
}

export function filterItems(days: Day[], items: Item[]) {
	return Array.from(days, (d) => items.filter((i) => compareDates(i.date, d.date)))
}
