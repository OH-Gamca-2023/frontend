import { devOptionsEnabled } from '$lib/settings'
import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load = (() => {
	if(!devOptionsEnabled) {
		throw redirect(302, '/')
	}
}) satisfies PageLoad
