export interface Grade {
	id: number
	name: string
}

export interface Clazz {
	id: number
	name: string
	grade: Grade
	is_fake: boolean
}

export interface User {
	id: number
	username: string
	email: string
	first_name: string
	last_name: string
	clazz: Clazz
	microsoft_user: string
	type: 'student' | 'teacher' | 'organizer' | 'admin'
	has_password: boolean
}
