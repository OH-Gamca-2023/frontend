import type { Clazz } from './users'

export interface Cipher {
	id: number

	start: Date
	started: boolean

	submission_delay: number // Seconds
	max_submissions_per_day: number

	name?: string
	task_file?: string // URL
	task_file_ext?: string
	hint?: string

	hint_publish_time?: Date
	hint_visible: boolean

	end: Date
	has_ended: boolean

	rating?: Rating

	data: {
		solved: boolean
		after_hint: boolean
		attempts: number
	} | null
	submissions: Promise<Submission[]>
}

export interface Rating {
	stars: number
	detail: string
}

export interface Submission {
	id: number
	clazz: Clazz
	submitted_by: number // User ID, will not be translated to a user object for security reasons
	answer: string
	time: Date
	after_hint: boolean
	correct: boolean
}
