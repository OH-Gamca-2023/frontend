import type { User } from '$lib/types'

export interface UserState {
	loggedIn: boolean
	user: User | null
}
