import type { Post } from './posts'
import type { Clazz, Grade } from './users'

export interface Tag {
	id: number
	name: string
}

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
	tags: Tag[]

	date: string
	time: string
	location: string
	volatile_date: boolean

	category: Category
	target_grades: Grade[]

	date_published: boolean
	description_published: boolean
	results_published: boolean

	details_post: Post
	results_post: Post
}

export interface Results {
	id: number
	discipline: Discipline

	placements: { clazz: Clazz; place: number }[]
}
