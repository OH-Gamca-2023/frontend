import type { Clazz, Category } from './users'

export interface Tag {
	id: number
	name: string
}

export interface Discipline {
	id: number
	name: string
	description: string
	tags: Tag[]

	date: string
	time: string
	location: string

	target_categories: Category[]

	date_published: boolean
	description_published: boolean
}

export interface Results {
	id: number
	discipline: Discipline

	placements: { clazz: Clazz; place: number }[]
}
