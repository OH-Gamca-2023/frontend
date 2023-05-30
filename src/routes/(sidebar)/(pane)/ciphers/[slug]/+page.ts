import type { PageLoad } from './$types'

export const prerender = false

export const load = (({ params }) => {
	return {
		cipherId: params.slug,
	}
}) satisfies PageLoad
