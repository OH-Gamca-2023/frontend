import type { Category } from '$lib/types'
import { LoadableModel } from '$lib/models'

export const categories = new LoadableModel<Category>(
	'diciplines/categories',
	(rawCategory: any) => ({
		id: rawCategory.id,
		name: rawCategory.name,
	}),
	true,
	[],
)
