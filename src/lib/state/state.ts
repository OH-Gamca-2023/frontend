import { browser } from '$app/environment'
import { getUserDetails, invalidateAccessToken, type ErrorResponse } from '$lib/api'
import type { Readable, Subscriber } from 'svelte/store'
import type { UserState } from './types'
import { clazzes } from './data'
import { Buffer } from 'buffer'

function rotateAlphabetically(token: string, rotation: number) {
	let rotated = ''
	for (let i = 0; i < token.length; i++) {
		let charCode = token.charCodeAt(i)
		let base
		if (charCode >= 65 && charCode <= 90) {
			base = 65
		} else if (charCode >= 97 && charCode <= 122) {
			base = 97
		} else {
			rotated += token[i]
			continue
		}
		charCode = ((((charCode - base + rotation) % 26) + 26) % 26) + base
		rotated += String.fromCharCode(charCode)
	}
	return rotated
}

function encodeToken(token: string, expiryDate: number) {
	const rotatedToken = rotateAlphabetically(token, 7)
	const encryptedToken = Buffer.from(rotatedToken).toString('base64')
	const encryptedExpiry = Buffer.from(String(expiryDate)).toString('base64')
	return rotateAlphabetically(encryptedToken + '.' + encryptedExpiry, 3)
}

function decodeToken(rawToken: string) {
	const decryptedLayer1 = rotateAlphabetically(rawToken, -3)
	const [encryptedToken, encryptedExpiry] = decryptedLayer1.split('.')
	const decryptedToken = Buffer.from(encryptedToken, 'base64').toString('ascii')
	const decryptedExpiry = Buffer.from(encryptedExpiry, 'base64').toString('ascii')
	const expiryDate = Number(decryptedExpiry)
	const token = rotateAlphabetically(decryptedToken, -7)
	return { token, expiryDate }
}

class InternalUserState implements Readable<UserState> {
	private subscribers: Set<Subscriber<UserState>> = new Set()

	private currentState: UserState = {
		user: null,
		loggedIn: false,
		loading: true,
	}
	private currentAccessToken: string | undefined = undefined
	private currentTokenExpiry: number | undefined = undefined

	private resolveLoaded: ((state: UserState) => void) | undefined = undefined
	public loaded: Promise<UserState> = new Promise((resolve) => {
		this.resolveLoaded = resolve
	})

	get accessToken(): string | undefined {
		if (!browser) return undefined
		if (this.currentAccessToken === undefined) {
			const rawToken = localStorage.getItem('token')
			if (rawToken) {
				const { token, expiryDate } = decodeToken(rawToken)
				if (expiryDate > new Date().getTime()) {
					this.currentAccessToken = token
					this.currentTokenExpiry = expiryDate
				} else {
					this.accessToken = undefined
				}
			}
		} else if (this.currentTokenExpiry && this.currentTokenExpiry < new Date().getTime()) {
			this.accessToken = undefined
		}
		return this.currentAccessToken
	}

	set accessToken(token: string | undefined) {
		if (!browser) return
		if (token) {
			const expires = new Date().getTime() + 1000 * 60 * 60 * 24 * 7
			localStorage.setItem('token', encodeToken(token, expires))
			this.currentTokenExpiry = expires
		} else {
			localStorage.removeItem('token')
			this.currentTokenExpiry = undefined
		}
		this.currentAccessToken = token
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

	constructor() {
		const token = this.accessToken
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
				this.accessToken = undefined
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
		if (this.accessToken) {
			const resp = await invalidateAccessToken()
			if (resp.error) {
				const { errorCode, errorMessage } = resp as ErrorResponse
				console.error('Failed to invalidate token', errorCode, errorMessage)
				error = true
			}
		} else {
			console.warn('No access token to invalidate')
		}

		this.accessToken = undefined
		this.state = {
			user: null,
			loggedIn: false,
			loading: false,
		}
		return !error
	}
}

export const userState = new InternalUserState()
