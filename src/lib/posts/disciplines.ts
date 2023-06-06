import { grades } from '$lib/state'
import type { Discipline } from '$lib/types'
import { PartialModel } from '$lib/utils/models'
import { get } from 'svelte/store'
import { categories, tags } from './data'
import { getUser, setRawUser } from './users'

class DisciplineModel extends PartialModel<Discipline> {
	constructor() {
		super(
			'disciplines',
			(data) => {
				const rawDiscipline = data as any

				if (rawDiscipline.primary_organiser) {
					setRawUser(rawDiscipline.primary_organiser)
				}

				if (rawDiscipline.organisers && rawDiscipline.organisers.length > 0) {
					rawDiscipline.organisers.forEach((organiser: any) => {
						setRawUser(organiser)
					})
				}

				if (rawDiscipline.teacher_supervisors && rawDiscipline.teacher_supervisors.length > 0) {
					rawDiscipline.teacher_supervisors.forEach((teacher: any) => {
						setRawUser(teacher)
					})
				}


				return {
					id: rawDiscipline.id,

					name: rawDiscipline.name,
					short_name: rawDiscipline.short_name,
					details: rawDiscipline.details,

					date: rawDiscipline.date,
					time: rawDiscipline.time,
					location: rawDiscipline.location,
					volatile_date: rawDiscipline.volatile_date,

					category: get(categories)[rawDiscipline.category.id],
					target_grades: rawDiscipline.target_grades.map((grade: any) => get(grades)[grade.id]),

					date_published: rawDiscipline.date_published,
					description_published: rawDiscipline.description_published,
					results_published: rawDiscipline.results_published,

					get primary_organiser() {
						return rawDiscipline.primary_organiser ? getUser(rawDiscipline.primary_organiser.id) : undefined
					},
					get organisers() {
						return rawDiscipline.organisers.map((organiser: any) => getUser(organiser.id))
					},
					get teacher_supervisors() {
						return rawDiscipline.teacher_supervisors.map((teacher: any) => getUser(teacher.id))
					}

				} as Discipline
			},
			false,
			[tags, categories, grades],
		)
	}
}

export const disciplines = new DisciplineModel()
