import { grades } from '$lib/state'
import type { Discipline } from '$lib/types'
import { PartialModel } from '$lib/utils/models'
import { categories, tags } from './data'

class DisciplineModel extends PartialModel<Discipline> {
	constructor() {
		super('disciplines', (data) => {
			const rawDiscipline = data as any

			return null as any as Discipline
		}, 
		true,
		[tags, categories, grades]
		)
	}
}


export const disciplines = new DisciplineModel()