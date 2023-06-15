export interface Grade {
	id: number
	name: string
	competing: boolean
	cipher_competing: boolean

	is_organiser: boolean
	is_teacher: boolean
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
	phone_number: string
	clazz: Clazz
	microsoft_user: string
	type: 'student' | 'teacher' | 'organiser' | 'admin' | 'alumni'
	has_password: boolean

	individual_cipher_solving: boolean

	permissions: {
		staff: boolean
		teacher: boolean
		admin: boolean
		superuser: boolean
		type: 'student' | 'teacher' | 'organiser' | 'admin' | 'alumni'
		profile_edit: string[]
		permissions: string[]
	}
}

export interface UserState {
	loading: boolean
	loggedIn: boolean
	user: User | null
}