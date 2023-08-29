import { categories } from '$lib/api/models'
import { grades as gradesModel } from './generic'
import { LoadableModel } from '$lib/utils/models'
import type { CalendarData, CalendarEvent, CalendarProps } from '$lib/types/calendar'

export const calendarData = new LoadableModel<CalendarData>(
	'calendar/auto.json',
	(data) => {
		// split props and events
		const { events, ...props } = data as any

		// parse events
		const parsedEvents = events.map((event: any) => {
			const { date, category, grades, ...rest } = event
			return {
				...rest,
				date: new Date(date),
				get category() {
					return categories.get(category)
				},
				get grades() {
					return grades.map((grade: string) => gradesModel.get(grade))
				},
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
	'single',
	true,
)

// Update calendar when userState changes
let previusUser: number | null | undefined = undefined

setTimeout(async () => {
	const { userState } = await import('$lib/state')
	userState.subscribe((state) => {
		if (previusUser === undefined) {
			previusUser = state.user?.id || null
			if (state.loggedIn) calendarData.reload()
			return
		}
		if (state.loggedIn) {
			if (previusUser !== state.user?.id) {
				previusUser = state.user?.id || null
				calendarData.reload()
			}
		} else {
			previusUser = null
			calendarData.reload()
		}
	})
}, 100)