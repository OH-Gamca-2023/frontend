import { browser } from "$app/environment"
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

export function setAccessToken(token: string | undefined) {
    if (!browser) return
    if (token) {
        const expires = new Date().getTime() + 1000 * 60 * 60 * 24 * 7
        localStorage.setItem('token', encodeToken(token, expires))
        currentTokenExpiry = expires
    } else {
        localStorage.removeItem('token')
        currentTokenExpiry = undefined
    }
    currentAccessToken = token
}