export type PostFilter = {
	category?: number[]
	tags?: number[]
	discipline?: string[]
	author?: number
	search?: string
	offset?: number
	limit?: number
}

export const filterKeys = {
    category: 'number[]',
    tags: 'number[]',
    discipline: 'string[]',
    author: 'number',
    search: 'string',
    offset: 'number',
    limit: 'number'
}