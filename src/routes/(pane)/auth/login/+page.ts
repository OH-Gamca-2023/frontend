import { browser } from '$app/environment'
import type { PageLoad } from './$types'

export const load = (() => {
	const urlParams = browser ? new URLSearchParams(window.location.search) : new URLSearchParams()
	const params = Object.fromEntries(urlParams.entries())
	if (browser) window.history.replaceState({}, document.title, window.location.pathname)

	return {
		status: params.status || 'none',
		params,
	}
}) satisfies PageLoad
