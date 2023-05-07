import { categories } from '$lib/posts'
import { grades as gradesModel } from '$lib/state'
import { LoadableModel } from '$lib/utils/models'
import { get } from 'svelte/store'
import type { CalendarData, CalendarEvent, CalendarProps } from './types'

export const calendarData = new LoadableModel<CalendarData>(
	'/calendar/json.json',
	(data) => {
		// split props and events
		const { events, ...props } = data as any

		// parse events
		const parsedEvents = events.map((event: any) => {
			const { date, category, grades, ...rest } = event
			return {
				...rest,
				date: new Date(date),
				category: get(categories)[category],
				grades: grades.map((grade: number) => get(gradesModel)[grade]),
			} as CalendarEvent
		})

		// return parsed data
		return {
			...(props as CalendarProps),
			events: parsedEvents,
		}
	},
	true,
	[gradesModel, categories],
	'single'
)
