import type { PageLoad } from './$types'

export const prerender = false

export const load = (({ params }) => {
	return {
		disciplineId: params.slug,
	}
}) satisfies PageLoad
