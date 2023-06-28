import { disciplines } from '$lib/api/models'
import type { FilterResult } from '$lib/components/filter/Filter.svelte'
import { get } from 'svelte/store'
import type { PageLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const prerender = false

export const load = (({params}) => {
    const filter: FilterResult = {
        categories: [],
        tags: [],
        grades: [],
    }
    let rawFilter = params.filter
    if(rawFilter.endsWith('/')) rawFilter = rawFilter.slice(0, -1)
    if(rawFilter.startsWith('/')) rawFilter = rawFilter.slice(1)
    const parts = rawFilter.split('/').filter(e => e.length > 0)


    if(parts.length == 1) {
        // Will work once disciplines are made cacheable
        if (get(disciplines)[parts[0]] !== undefined) {
            throw redirect(302, `/discipline/${parts[0]}/results`)
        }
    }

    let lastKey: string | undefined
    for (const part of parts) {
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
            if (![ 'categories', 'grades' ].includes(lastKey)) console.error('Invalid filter key ' + lastKey)
        }
    }

    return {
        filter,
        rawFilter,
    }
}) satisfies PageLoad
