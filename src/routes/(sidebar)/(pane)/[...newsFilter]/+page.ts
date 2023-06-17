import type { FilterResult } from '$lib/components/posts/filter/Filter.svelte'
import type { PageLoad } from './$types'

export const prerender = false

export const load = (({params}) => {
    const filter: FilterResult = {
        categories: [],
        tags: [],
        grades: [],
    }

    let lastKey: string | undefined
    if (params.newsFilter) {
        for (const part of params.newsFilter.split('/')) {
            if(part == 'news') continue
            if (lastKey) {
                try {
                    const ids = part.split(',').map(e => parseInt(e))
                    if (ids.some(isNaN)) throw new Error('Invalid filter value for ' + lastKey)
                    filter[lastKey as keyof FilterResult] = ids
                } catch (e) {
                    console.error(e)
                }
                lastKey = undefined
            } else {
                lastKey = part
                if (![ 'categories', 'tags', 'grades' ].includes(lastKey)) console.error('Invalid filter key ' + lastKey)
            }
        }
    }

    return {
        filter,
        rawFilter: params.newsFilter,
    }
}) satisfies PageLoad
