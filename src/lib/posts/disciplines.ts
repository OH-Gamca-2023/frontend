import { grades } from '$lib/state'
import type { Discipline } from '$lib/types'
import { PartialModel } from '$lib/utils/models'
import { get } from 'svelte/store'
import { categories, tags } from './data'
import { posts } from './posts'

class DisciplineModel extends PartialModel<Discipline> {
	constructor() {
		super('disciplines', (data) => {
			const rawDiscipline = data as any

			return {
				id: rawDiscipline.id,

				name: rawDiscipline.name,
				short_name: rawDiscipline.short_name,
				details: rawDiscipline.details,
				tags: rawDiscipline.tags.map((tag: any) => get(tags)[tag.id]),

				date: rawDiscipline.date,
				time: rawDiscipline.time,
				location: rawDiscipline.location,
				volatile_date: rawDiscipline.volatile_date,

				category: get(categories)[rawDiscipline.category.id],
				target_grades: rawDiscipline.target_grades.map((grade: any) => get(grades)[grade.id]),

				date_published: rawDiscipline.date_published,
				description_published: rawDiscipline.description_published,
				results_published: rawDiscipline.results_published,

				get details_post() {
					return posts.get(rawDiscipline.details_post)
				},
				get results_post() {
					return posts.get(rawDiscipline.results_post)
				}
			} as Discipline
		}, 
		true,
		[tags, categories, grades]
		)
	}
}


export const disciplines = new DisciplineModel()