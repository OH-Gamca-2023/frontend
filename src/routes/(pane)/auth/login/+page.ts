import { browser } from '$app/environment'
import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load = (({url}) => {
	if (url.pathname !== '/auth/login/disabled') throw redirect(302, '/auth/login/disabled')

	const urlParams = browser ? new URLSearchParams(window.location.search) : new URLSearchParams()
	const parsedParams = Object.fromEntries(urlParams.entries())
	if (browser) window.history.replaceState({}, document.title, window.location.pathname)

	return {
		status: parsedParams.status || 'none',
		parsedParams,
	}
}) satisfies PageLoad
