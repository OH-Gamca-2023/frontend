import { browser } from '$app/environment'
import { Buffer } from 'buffer'

function encodeToken(token: string, expiryDate: number) {
	const base64Token = Buffer.from(token).toString('base64')
	const tokenString = base64Token + '.' + expiryDate
	const encodedLayer1 = Buffer.from(tokenString).map((byte) => byte ^ 0x41)

	const random = Math.floor(Math.random() * 256)
	const encodedLayer2 = Buffer.from(Buffer.from(encodedLayer1).map((byte) => byte ^ random))

	return random + '.' + encodedLayer2.toString('base64')
}

function decodeToken(rawToken: string) {
	const [random, encodedLayer2] = rawToken.split('.')

	const encodedLayer1 = Buffer.from(encodedLayer2, 'base64').map((byte) => byte ^ Number(random))
	const tokenString = Buffer.from(encodedLayer1)
		.map((byte) => byte ^ 0x41)
		.toString()

	const [base64Token, expiryDate] = tokenString.split('.')
	const token = Buffer.from(base64Token, 'base64').toString()

	return { token, expiryDate: Number(expiryDate) }
}

let currentAccessToken: string | undefined = undefined
let currentTokenExpiry: number | undefined = undefined

export function getAccessToken(): string | undefined {
	if (!browser) return undefined
	if (currentAccessToken === undefined) {
		const rawToken = localStorage.getItem('token')
		if (rawToken) {
			const { token, expiryDate } = decodeToken(rawToken)
			if (expiryDate > new Date().getTime()) {
				currentAccessToken = token
				currentTokenExpiry = expiryDate
			} else {
				setAccessToken(undefined)
			}
		}
	} else if (currentTokenExpiry && currentTokenExpiry < new Date().getTime()) {
		setAccessToken(undefined)
	}
	return currentAccessToken
}

export function setAccessToken(token: string | undefined, expiry?: string) {
	if (!browser) return
	if (token) {
		const expires = expiry
			? new Date(expiry).getTime()
			: new Date().getTime() + 1000 * 60 * 60 * 24 * 7
		localStorage.setItem('token', encodeToken(token, expires))
		currentTokenExpiry = expires
	} else {
		localStorage.removeItem('token')
		currentTokenExpiry = undefined
	}
	currentAccessToken = token
}
