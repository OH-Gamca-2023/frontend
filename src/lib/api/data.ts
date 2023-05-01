import { browser } from '$app/environment'

export function getApiHost() {
	if (!browser) return '/api'

	if (window.location.port === '5173' || window.location.port === '4173')
		return window.location.protocol + '//' + window.location.hostname + ':8000/api'
	return window.location.protocol + '//' + window.location.hostname + '/api'
}
