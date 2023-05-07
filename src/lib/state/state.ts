import { getUserDetails, invalidateAccessToken, type ErrorResponse } from '$lib/api'
import { get, type Readable, type Subscriber } from 'svelte/store'
import type { UserState } from './types'
import { clazzes } from './data'
import { getAccessToken, setAccessToken } from './token'

class InternalUserState implements Readable<UserState> {
	private subscribers: Set<Subscriber<UserState>> = new Set()

	private currentState: UserState = {
		user: null,
		loggedIn: false,
		loading: true,
	}

	private resolveLoaded: ((state: UserState) => void) | undefined = undefined
	public loaded: Promise<UserState> = new Promise((resolve) => {
		this.resolveLoaded = resolve
	})

	subscribe(subscriber: Subscriber<UserState>) {
		this.subscribers.add(subscriber)
		subscriber(this.currentState)
		return () => this.subscribers.delete(subscriber)
	}

	set state(newState: UserState) {
		this.currentState = newState
		this.subscribers.forEach((subscriber) => subscriber(newState))
	}

	constructor() {
		const token = getAccessToken()
		if (token) {
			this.state = {
				user: null,
				loggedIn: false,
				loading: true,
			}
			clazzes.onLoaded(() => this.fetchUser())
			clazzes.onLoadError(() => {
				this.state = {
					user: null,
					loggedIn: false,
					loading: false,
				}
				this.resolveLoaded?.(this.currentState)
			})
		} else {
			this.state = {
				user: null,
				loggedIn: false,
				loading: false,
			}
			this.resolveLoaded?.(this.currentState)
		}
	}

	async fetchUser() {
		this.state = {
			...this.currentState,
			loading: true,
		}
		const response = await getUserDetails()
		if (!response.error) {
			const rawUser = response.data!
			const user = {
				...rawUser,
				clazz: get(clazzes)[rawUser.clazz as any]!,
			}
			this.state = {
				user,
				loggedIn: true,
				loading: false,
			}
		} else {
			this.state = {
				user: null,
				loggedIn: false,
				loading: false,
			}
			if (response.status === 401) {
				setAccessToken(undefined)
			}
		}
		if (this.resolveLoaded) {
			this.resolveLoaded(this.currentState)
			this.resolveLoaded = undefined
		}
	}

	async logout() {
		let error = false
		if (!this.currentState.loggedIn) return
		if (getAccessToken()) {
			const resp = await invalidateAccessToken()
			if (resp.error) {
				const { errorCode, errorMessage } = resp as ErrorResponse
				console.error('Failed to invalidate token', errorCode, errorMessage)
				error = true
			}
		} else {
			console.warn('No access token to invalidate')
		}

		setAccessToken(undefined)
		this.state = {
			user: null,
			loggedIn: false,
			loading: false,
		}
		return !error
	}
}

export const userState = new InternalUserState()
