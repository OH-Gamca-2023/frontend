type RequestMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

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

export async function makeApiRequest(url: string, method: RequestMethods, body?: object | string) {
	const headers = new Headers()
	switch (typeof body) {
		case 'object':
			headers.append('Content-Type', 'application/json')
			break
		case 'string':
			headers.append('Content-Type', 'text/plain')
			break
	}

	if (url.startsWith('/api')) url = url.slice(4)
	if (!url.startsWith('/')) url = '/' + url

	return fetch('/api' + url, {
		method,
		headers,
		body: typeof body === 'object' ? JSON.stringify(body) : body,
	})
}
