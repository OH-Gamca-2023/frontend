export interface Category {
	id: number
	name: string
}

export interface Clazz {
	id: number
	name: string
	category: Category
	is_fake: boolean
}

export interface User {
	id: number
	name: string
	clazz: Clazz
	type: 'student' | 'teacher' | 'organizer' | 'admin'
}
