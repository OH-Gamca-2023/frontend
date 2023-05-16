import { filterKeys, type PostFilter } from '$lib/types'
import type { PageLoad } from './$types'

export const prerender = false

export const load = (({ params }) => {
	const splitFilter = params.filter.split('/')

    const filter: PostFilter = {}
    
    let key = ''
    for (const part of splitFilter) {
        if (key) {
            if(Object.keys(filterKeys).includes(key)) {
                const val = parseValue(filterKeys[key as keyof PostFilter], part)
                filter[key as keyof PostFilter] = val
            } else {
                console.warn(`Invalid filter key: ${key}`)
            }
            key = ''
        } else {
            key = part
        }
    }

    return {
        filter,
        rawFilter: params.filter,
    }
}) satisfies PageLoad

function parseValue(type: string, value: string): any {
    if (type.endsWith('[]')) {
        type = type.slice(0, -2)
        return value.split('|').map(val => parseValue(type, val))
    } else if (type === 'number') {
        return Number(value)
    } else if (type === 'boolean') {
        return value === 'true' || value === '1'
    } else {
        return value
    }
}