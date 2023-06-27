import type { FilterResult } from '$lib/components/filter/Filter.svelte'
import type { PageLoad } from '../../disciplines copy/[...filter]/$types'

export const prerender = false

export const load = (({params}) => {
    const filter: FilterResult = {
        categories: [],
        tags: [],
        grades: [],
    }
    let requireResults = false

    let lastKey: string | undefined
    if (params.filter) {
        for (const part of params.filter.split('/')) {
            if(part === 'news' || part === '') continue
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
                if (lastKey === 'results') {
                    requireResults = true, lastKey = undefined
                    continue
                }
                if (![ 'categories', 'tags', 'grades' ].includes(lastKey)) console.error('Invalid filter key ' + lastKey)
            }
        }
    }

    return {
        filter,
        rawFilter: params.filter,
        requireResults,
    }
}) satisfies PageLoad
