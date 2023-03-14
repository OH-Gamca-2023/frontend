import type { Clazz, Grade } from './users'

export interface Tag {
	id: number
	name: string
}

export interface Category {
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

	grades: Grade[]
	category: Category

	date_published: boolean
	description_published: boolean
}

export interface Results {
	id: number
	discipline: Discipline

	placements: { clazz: Clazz; place: number }[]
}
