import { browser } from '$app/environment'
import { getAccessToken, setAccessToken } from '$lib/state/token'
import { get } from 'svelte/store'
import { getApiHost } from '$lib/data/api'
import type { ApiResponse, RequestMethod, ErrorResponse, SuccessResponse } from '$lib/types'
import { toast } from '$lib/utils/toasts'

async function internalApiRequest(
	url: string,
	method: RequestMethod,
	body: object | string | undefined,
	auth: boolean,
	canRetry = true,
	ignore401 = false,
): Promise<Response> {
	if (!browser) return await fetch('', { method: 'GET' })
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

	const resp = await fetch(getApiHost() + url, {
		method,
		headers,
		body: typeof body === 'object' ? JSON.stringify(body) : body,
	})

	if (resp.status == 401 && auth && getAccessToken() && !ignore401) {
		console.warn('Received 401 when attempting an authorizated request')
		// User was probably logged out
		if (canRetry) {
			try {
				const state = (await import('../state/state')).userState
				await state.fetchUser()
				if (!get(state).loggedIn) {
					toast({
						title: 'Boli ste odhlásený',
						type: 'error',
						duration: 5000,
					})
				}
			} catch (e) {
				console.error('Failed to validate logout', e)
				console.error('Forcing local logout for safety reasons...')
				setAccessToken(undefined)
				toast({
					title: 'Boli ste odhlásený',
					message: 'Počas spracovávania údajov nastala chyba',
					type: 'error',
					duration: 5000,
				})
			}

			// retry request
			return await internalApiRequest(url, method, body, auth, false)
		} else {
			console.error('Failed to retry request, giving up')
			console.error('Forcing local logout for safety reasons...')
			setAccessToken(undefined)
			toast({
				title: 'Boli ste odhlásený',
				message: 'Počas spracovávania údajov nastala chyba (2)',
				type: 'error',
				duration: 5000,
			})
		}
	}
	return resp
}

/**
 * Don't use this function directly, use the endpoints or LoadableModel instead.
 */
export async function makeApiRequest<T>(
	url: string,
	method: RequestMethod,
	body: object | string | undefined,
	auth: boolean,
	ignore401 = false,
): Promise<ApiResponse<T>> {
	try {
		const response = await internalApiRequest(url, method, body, auth, true, ignore401)

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
					error: true,
					data,
				} as ErrorResponse
			}
	} catch (e) {
		console.warn('Connection error', e)
	}
	return {
		status: 599,
		error: true,
		data: {
			error: 'Connection error',
		},
	} as ErrorResponse
}
