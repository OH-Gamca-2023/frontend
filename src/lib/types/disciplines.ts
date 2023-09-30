import type { Clazz, Grade, User } from './users'

export interface Category {
	id: number
	name: string
	calendarClass: string
	icon: string
}

export interface Discipline {
	id: string
	name: string
	short_name: string
	details: string
	result_details: string

	date: Date | null
	start_time: Date | null
	end_time: Date | null
	location: string

	category: Category
	target_grades: Grade[]

	date_published: boolean
	details_published: boolean
	results_published: boolean

	// Only available for organisers and teachers
	primary_organisers?: Partial<User>[]
	teacher_supervisors?: Partial<User>[]
	teacher_supervisors_enabled: boolean
}

export interface Results {
	id: number
	name: string
	grades: Grade[]
	discipline: Discipline

	placements: Placement[]
	group_identical: boolean
}

export interface Placement {
	clazz: Clazz
	place: number
	participated: boolean
}

export interface Sidebar {
	upcoming: Partial<Discipline>[]
	organising?: Partial<Discipline>[]
	supervising?: Partial<Discipline>[]
}