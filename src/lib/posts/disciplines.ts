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

				if (rawDiscipline.primary_organisers && rawDiscipline.primary_organisers.length > 0) {
					rawDiscipline.primary_organisers.forEach((organiser: any) => {
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

					date: rawDiscipline.date ? new Date(rawDiscipline.date) : null,
					time: rawDiscipline.time ? new Date("1970-01-01T" + rawDiscipline.time) : null,
					location: rawDiscipline.location,

					get category() {
						return get(categories)[rawDiscipline.category]
					},
					get target_grades() {
						return rawDiscipline.target_grades.map((grade: any) => get(grades)[grade])
					},

					date_published: rawDiscipline.date_published,
					details_published: rawDiscipline.details_published,
					results_published: rawDiscipline.results_published,

					get primary_organisers() {
						if (!rawDiscipline.primary_organisers) return []
						return rawDiscipline.primary_organisers.map((organiser: any) => getUser(organiser.id))
					},
					get teacher_supervisors() {
						if (!rawDiscipline.teacher_supervisors) return []
						return rawDiscipline.teacher_supervisors.map((teacher: any) => getUser(teacher.id))
					},
				} as Discipline
			},
			false,
			[tags, categories, grades],
			true,
		)
	}
}

export const disciplines = new DisciplineModel()
