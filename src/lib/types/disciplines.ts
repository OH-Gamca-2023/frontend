import type { Clazz, Grade, User } from './users'

export interface Category {
	id: number
	name: string
	calendarClass: string
}

export interface Discipline {
	id: string
	name: string
	short_name: string
	details: string

	date: Date | null
	time: Date | null
	location: string

	category: Category
	target_grades: Grade[]

	date_published: boolean
	details_published: boolean
	results_published: boolean

	// Only available for organisers and teachers
	primary_organisers?: Partial<User>[]
	teacher_supervisors?: Partial<User>[]
}

export interface Results {
	id: number
	name: string
	grades: Grade[]
	discipline: Discipline

	placements: { clazz: Clazz; place: number }[]
}
