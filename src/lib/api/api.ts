import { browser } from '$app/environment'
import { getAccessToken } from '$lib/state/token'
import { getApiHost } from './data'
import type { ApiResponse, RequestMethod, ErrorResponse, SuccessResponse } from './types'

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

	if (auth && getAccessToken())
		headers.append('Authorization', `Bearer ${getAccessToken()}`)
	else if (auth)
		console.warn('No access token found for authenticated request. Details:', url, method, body)

	if (url.startsWith('/api')) url = url.slice(4)
	if (!url.startsWith('/')) url = '/' + url
	if (!url.endsWith('/')) url += '/'

	return fetch(getApiHost() + url, {
		method,
		headers,
		body: typeof body === 'object' ? JSON.stringify(body) : body,
	})
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
