import type { Clazz, Grade } from '$lib/types'
import { LoadableModel } from '$lib/utils/models'

export const grades = new LoadableModel<Grade>(
	'user/grades',
	(rawGrade: any) => ({
		id: rawGrade.id,
		name: rawGrade.name,
		competing: rawGrade.competing,
		cipher_competing: rawGrade.cipher_competing,
		is_organiser: rawGrade.is_organiser,
		is_teacher: rawGrade.is_teacher,
	}),
	true,
	[],
)

export const clazzes = new LoadableModel<Clazz>(
	'user/classes',
	(rawClazz: any) => ({
		id: rawClazz.id,
		name: rawClazz.name,
		grade: grades.get(rawClazz.grade)!,
		is_fake: rawClazz.is_fake,
	}),
	true,
	[grades],
)
