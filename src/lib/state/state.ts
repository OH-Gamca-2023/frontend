import { getUserDetails, logout, type ErrorResponse, logoutAll } from '$lib/api'
import type { Readable, Subscriber } from 'svelte/store'
import type { UserState } from '$lib/types'
import { clazzes } from '$lib/api/models'
import { getAccessToken, setAccessToken } from './token'
import type { LoadableModel } from '$lib/utils/models'


class InternalUserState implements Readable<UserState> {
	private subscribers: Set<Subscriber<UserState>> = new Set()
	private modelsUpdatingOnUserChange = new Set<LoadableModel<any>>()

	private previousUser: number | null | undefined = undefined
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
		
		if(this.previousUser === undefined) {
			this.previousUser = newState.user?.id || null
			this.modelsUpdatingOnUserChange.forEach(model => {
				console.debug('[UserState] Reloading model', model.getApiUrl())
				model.reload()
			})
		} else if (this.previousUser !== newState.user?.id) {
			this.previousUser = newState.user?.id || null
			this.modelsUpdatingOnUserChange.forEach(model => {
				console.debug('[UserState] Reloading model', model.getApiUrl())	
				model.reload()
			})
		}
		
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
				clazz: clazzes.get(rawUser.clazz as any)!,
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
			const resp = await logout()
			if (resp.error) {
				console.error('Failed to log out', resp.status, (resp as ErrorResponse).data)
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

	async logoutAllDevices() {
		if (!this.currentState.loggedIn) return
		if (getAccessToken()) {
			const resp = await logoutAll()
			if (resp.error) {
				console.error('Failed to log out all devices', resp.status, (resp as ErrorResponse).data)
				return false
			}
		}
		await this.fetchUser()
		return true
	}

	public registerModel(model: LoadableModel<any>) {
		this.modelsUpdatingOnUserChange.add(model)
	}

	public unregisterModel(model: LoadableModel<any>) {
		this.modelsUpdatingOnUserChange.delete(model)
	}
	
}

export const userState = new InternalUserState()
