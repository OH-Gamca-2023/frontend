import { getUserDetails } from '$lib/api'
import { clazzes } from '$lib/api/models'
import type { User } from '$lib/types'

const cachedUsers = new Map<string, User>()

export function getUser(id: string): User | undefined {
	if (cachedUsers.has(id.toString())) {
		return cachedUsers.get(id.toString())
	}
}

export async function fetchUser(id: string): Promise<User | undefined> {
	const resp = await getUserDetails(id)

	if (resp.status == 401 || resp.status == 403) {
		console.warn('Attempted to fetch user details without permission')
		return
	}

	const rawUser = resp.data!
	const user = {
		...rawUser,
		clazz: clazzes.get(rawUser.clazz as any)!,
	}

	cachedUsers.set(id, user)
	return user
}

export function setUser(user: User) {
	cachedUsers.set(user.id.toString(), user)
}

export function setRawUser(rawUser: any) {
	const user = {
		...rawUser,
		clazz: clazzes.get(rawUser.clazz as any)!,
	}
	cachedUsers.set(user.id.toString(), user)
}
