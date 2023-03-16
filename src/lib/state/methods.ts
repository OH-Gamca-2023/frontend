import { browser } from '$app/environment'
import { getUserDetails, makeApiRequest } from '$lib/api'
import type { Clazz, Grade } from '$lib/types'
import type { Readable, Subscriber } from 'svelte/store'
import type { UserState } from './types'
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
		charCode = ((charCode - base + rotation) % 26 + 26) % 26 + base
		rotated += String.fromCharCode(charCode)
	}
	return rotated
}

function encodeToken(token: string, expiryDate: number) {
	const rotatedToken = rotateAlphabetically(token, 7)
	const encryptedToken = Buffer.from(rotatedToken).toString('base64')
	const encryptedExpiry = Buffer.from(String(expiryDate)).toString('base64')
	return rotateAlphabetically(encryptedToken + "." + encryptedExpiry, 3)
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
			setTimeout(() => this.fetchUser(), 50)
		} else {
			this.state = {
				user: null,
				loggedIn: false,
				loading: false,
			}
		}
	}

	async fetchUser() {
		this.state = {
			...this.currentState,
			loading: true,
		}
		const response = await getUserDetails()
		if (response.ok) {
			const rawUser = await response.json()
			if (!clazzes.has(rawUser.clazz)) {
				await fetchClazzes()
			}
			const user = {
				...rawUser,
				clazz: clazzes.get(rawUser.clazz),
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
			if(response.status === 401) {
				this.accessToken = undefined
			}
		}
	}
}

export const userState = new InternalUserState()

let grades: Map<number, Grade> = new Map()
let clazzes: Map<number, Clazz> = new Map()

export async function fetchGrades() {
	const response = await makeApiRequest('/user/grades', 'GET')
	if (response.ok) {
		const data = await response.json()
		grades = new Map(data.map((grade: Grade) => [grade.id, grade]))
	}
	return grades
}

export function getGrade(id: number) {
	return grades.get(id)
}

export async function fetchClazzes() {
	const response = await makeApiRequest('/user/classes', 'GET')
	if (response.ok) {
		const data = await response.json()
		clazzes = new Map()
		data.forEach((rawClazz: any) => {
			if (!grades.has(rawClazz.grade)) {
				fetchGrades()
			}
			clazzes.set(rawClazz.id, {
				id: rawClazz.id,
				name: rawClazz.name,
				grade: grades.get(rawClazz.grade)!,
				is_fake: rawClazz.is_fake,
			})
		})
	}
	return clazzes
}

export function getClazz(id: number) {
	return clazzes.get(id)
}
