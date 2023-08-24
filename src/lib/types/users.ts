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
	discord_id: string
	type: 'student' | 'teacher' | 'organiser' | 'admin' | 'alumni' | 'unknown'
	has_password: boolean

	individual_cipher_solving: boolean

	permissions: {
		staff: boolean
		teacher: boolean
		superuser: boolean
		type: 'student' | 'teacher' | 'organiser' | 'admin' | 'alumni' | 'unknown'
		profile_edit: ProfileEditPermissions 
		permissions: string[]
	}
}

export interface ProfileEditPermissions {
	username: boolean
	first_name: boolean
	last_name: boolean
	email: boolean
	phone_number: boolean
	password: boolean
	discord_id: boolean
}

export interface UserState {
	loading: boolean
	loggedIn: boolean
	user: User | null
}