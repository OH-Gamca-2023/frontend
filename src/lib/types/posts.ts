import type { Category, Discipline } from './disciplines'
import type { Grade, User } from './users'

export interface Tag {
	id: number
	name: string
}

export interface Post {
	id: number
	title: string
	content: string
	author: Partial<User>
	date: Date

	related_disciplines: Discipline[]
	discipline_categories: Category[]
	affected_grades: Grade[]
	tags: Tag[]
}
