/**
 * Helper function to call MS Graph API endpoint
 * using the authorization bearer token scheme
 */
export function callMSGraph(
	endpoint: URL | RequestInfo,
	token: string,
	callback: ((response: any, endpoint: URL | RequestInfo) => void) | undefined = undefined,
) {
	const headers = new Headers()
	const bearer = `Bearer ${token}`

	headers.append('Authorization', bearer)

	const options = {
		method: 'GET',
		headers: headers,
	}

	console.log('request made to Graph API at: ' + new Date().toString())

	if (callback === undefined) {
		return fetch(endpoint, options)
			.then((response) => response.json())
			.catch((error) => console.log(error))
	}

	fetch(endpoint, options)
		.then((response) => response.json())
		.then((response) => callback(response, endpoint))
		.catch((error) => console.log(error))
}
