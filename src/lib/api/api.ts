import { browser } from '$app/environment'
import { getAccessToken } from '$lib/state/token'
import { get } from 'svelte/store'
import { getApiHost } from './data'
import type { ApiResponse, RequestMethod, ErrorResponse, SuccessResponse } from './types'
import { toast } from '$lib/utils/toasts'
import { maxRequestTime } from '$lib/data/settings'

function internalApiRequest(
	url: string,
	method: RequestMethod,
	body: object | string | undefined,
	auth: boolean,
) {
	if (!browser) return fetch('', { method: 'GET' })
	const headers = new Headers()
	switch (typeof body) {
		case 'object':
			headers.append('Content-Type', 'application/json')
			break
		case 'string':
			headers.append('Content-Type', 'text/plain')
			break
	}

	if (auth && getAccessToken()) headers.append('Authorization', `Bearer ${getAccessToken()}`)
	else if (auth)
		console.warn('No access token found for authenticated request. Details:', url, method, body)

	if (url.startsWith('/api')) url = url.slice(4)
	if (!url.startsWith('/')) url = '/' + url
	if (!url.endsWith('/')) url += '/'

	const promises = [
		fetch(getApiHost() + url, {
			method,
			headers,
			body: typeof body === 'object' ? JSON.stringify(body) : body,
		}),
	]

	if (maxRequestTime > 0)
		promises.push(
			new Promise((resolve, reject) =>
				setTimeout(() => {
					console.warn(
						'Request to ' + url + ' took longer than ' + maxRequestTime + 'ms, terminating...',
					)
					resolve(new Response(JSON.stringify({
						error_code: 'timeout',
						error_message: 'Request took longer than ' + maxRequestTime + 'ms',
						internal: true,
					}), { status: 408 }))
				}, maxRequestTime),
			),
		)

	return Promise.race(promises)
}

/**
 * Don't use this function directly, use the endpoints or LoadableModel instead.
 */
export async function makeApiRequest<T>(
	url: string,
	method: RequestMethod,
	body: object | string | undefined,
	auth: boolean,
): Promise<ApiResponse<T>> {
	try {
		const response = await internalApiRequest(url, method, body, auth)

		if (response.status)
			if (response.status === 204) return { status: 204 } as SuccessResponse<never>
			else if (response.ok) {
				const data = await response.json()
				return { status: response.status, data, error: false } as SuccessResponse<T>
			} else {
				if (response.status == 401) {
					setTimeout(async () => {
						const state = (await import('../state/state')).userState
						if (!get(state).loggedIn) return
						await state.fetchUser()
						if (!get(state).loggedIn) {
							toast({
								title: 'Boli ste odhlásený',
								type: 'error',
								duration: 5000,
							})
						}
					}) // Run login check independently from the request
				}
				const data = await response.json()
				return {
					status: response.status,
					errorCode: data.error_code,
					errorMessage: data.error_message,
					internal: data.internal ?? false,
					error: true,
				} as ErrorResponse
			}
	} catch (e) {
		console.warn('Connection error', e)
	}
	return {
		status: 500,
		errorCode: 'connection',
		errorMessage: 'Connection or internal error',
		internal: true,
		error: true,
	} as ErrorResponse
}
