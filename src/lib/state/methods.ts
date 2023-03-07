import type { Readable, Subscriber } from 'svelte/store'
import type { UserState } from './types'

class InternalUserState implements Readable<UserState> {
	private subscribers: Set<Subscriber<UserState>> = new Set()

	private currentState: UserState = {
		user: null,
		loggedIn: false,
	}

	get accessToken(): string | undefined {
		return document.cookie
			.split(';')
			.find((cookie) => cookie.startsWith('token='))
			?.split('=')[1]
	}

	set accessToken(token: string | undefined) {
		let expires
		if (token === undefined) {
			expires = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
		} else {
			expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
		}
		document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict;secure;`
	}

	subscribe(subscriber: Subscriber<UserState>) {
		this.subscribers.add(subscriber)
		subscriber(this.currentState)
		return () => this.subscribers.delete(subscriber)
	}

	set state(newState: UserState) {
		this.currentState = newState
		this.subscribers.forEach((subscriber) => subscriber(newState))
	}
}

export const userState = new InternalUserState()
