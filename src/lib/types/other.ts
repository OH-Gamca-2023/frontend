export type PostFilter = {
	category?: number[]
	tags?: number[]
	discipline?: string[]
	author?: number
	search?: string
	page?: number
	max?: number
	sort?: boolean
}

export const filterKeys = {
    category: 'number[]',
    tags: 'number[]',
    discipline: 'string[]',
    author: 'number',
    search: 'string',
    page: 'number',
    max: 'number',
    sort: 'boolean'
}