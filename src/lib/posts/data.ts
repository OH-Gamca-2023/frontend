import type { Tag, Category } from '$lib/types'
import { LoadableModel } from '$lib/utils/models'

export const categories = new LoadableModel<Category>(
	'disciplines/categories',
	(rawCategory: any) => ({
		id: rawCategory.id,
		name: rawCategory.name,
		calendarClass: rawCategory.calendar_class,
	}),
	true,
	[],
)

export const tags = new LoadableModel<Tag>(
	'posts/tags',
	(rawTag: any) => ({
		id: rawTag.id,
		name: rawTag.name,
	}),
	true,
	[],
)