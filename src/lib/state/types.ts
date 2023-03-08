import type { User } from '$lib/types'

export interface UserState {
	loading: boolean
	loggedIn: boolean
	user: User | null
}
