import type { Category, Discipline, Tag } from './disciplines'
import type { Grade, User } from './users'

export interface Post {
	id: number
	title: string
	content: string
	author: Partial<User>
	date: number // Unix timestamp

	related_disciplines: Discipline[]
	discipline_categories: Category[]
	affected_grades: Grade[]
	tags: Tag[]

	disable_comments: boolean
}

export interface Comment {
	id: number
	post: Post
	author: Partial<User>
	content: string
	date: number // Unix timestamp

	parent: Comment | null
}
