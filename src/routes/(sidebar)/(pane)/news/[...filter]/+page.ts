import type { FilterResult } from '$lib/components/filter/Filter.svelte'
import type { PageLoad } from './$types'

export const prerender = false

export const load = (({ params }) => {
	const filter: FilterResult = {
		categories: [],
		tags: [],
		grades: [],
	}
	let rawFilter = params.filter
	if (rawFilter.endsWith('/')) rawFilter = rawFilter.slice(0, -1)
	if (rawFilter.startsWith('/')) rawFilter = rawFilter.slice(1)
	const parts = rawFilter.split('/').filter((e) => e.length > 0)

	let lastKey: string | undefined
	for (const part of parts) {
		if (part === 'news' || part === '') continue
		if (lastKey) {
			try {
				const ids = part.split(',').map((e) => parseInt(e))
				if (ids.some(isNaN)) throw new Error('Invalid filter value for ' + lastKey)
				filter[lastKey as keyof FilterResult] = ids
			} catch (e) {
				console.error(e)
			}
			lastKey = undefined
		} else {
			lastKey = part
			if (!['categories', 'tags', 'grades'].includes(lastKey))
				console.error('Invalid filter key ' + lastKey)
		}
	}

	return {
		filter,
		rawFilter,
	}
}) satisfies PageLoad
