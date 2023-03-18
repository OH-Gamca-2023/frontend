import { browser } from "$app/environment"
import { userState } from "./state"

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type ApiResponse = {
	status: number

	headers: Headers

	originalResponse: Response
}

export type ErrorResponse = ApiResponse & {
	error: string
}

export type SuccessResponse<T> = ApiResponse & {
	data: T
}

export function getApiHost() {
	if (!browser) return '/api'
	if(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
		return `http://${window.location.hostname}:8000/api`
	} else {
		return `https://${window.location.hostname}/api`
	}
}


export function makeApiRequest(url: string, method: RequestMethod, body?: object | string, noAuth = false){
	if(!browser) return fetch("", {method: "GET"})
	const headers = new Headers()
	switch (typeof body) {
		case 'object':
			headers.append('Content-Type', 'application/json')
			break
		case 'string':
			headers.append('Content-Type', 'text/plain')
			break
	}

	if(!noAuth && userState.accessToken) headers.append('Authorization', `Bearer ${userState.accessToken}`)

	if (url.startsWith('/api')) url = url.slice(4)
	if (!url.startsWith('/')) url = '/' + url
	if(!url.endsWith('/')) url += '/'

	return fetch(getApiHost() + url, {
		method,
		headers,
		body: typeof body === 'object' ? JSON.stringify(body) : body
	})
}

export function getUserDetails() {
	return makeApiRequest('/user/me', 'GET')
}