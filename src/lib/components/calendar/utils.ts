import { monthNames } from "./consts"
import type { Day, Item } from "./types"

export function compareDates(a: Date, b: Date): boolean {
    // check if the dates are in the same month and are the same day
    return a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function initMonthDays(month: number, year: number) {
	let now = new Date()
    let days = [] as Day[]
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
        days.push({
            name,
            enabled: true,
            date: d,
            today: i == now.getDate() - 1 && month == now.getMonth(),
        })
    }

    //	show any days to fill up the last row (disabled) - always less than 7
    for (let i = 0; days.length % 7; i++) {
        let d = new Date(month == 11 ? year + 1 : year, (month + 1) % 12, i + 1)
        let name = (i == 0 ? monthNames[nextMonth].shortName + ' ' : '') + (i + 1)
        days.push({ name, enabled: false, date: d })
    }

    return days
}

export function filterItems(days: Day[], items: Item[]) {
    return Array.from(days, (d) => (items.filter((i) => compareDates(i.date, d.date))))
}