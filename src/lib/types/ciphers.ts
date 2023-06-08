import type { Clazz } from "./users"

export interface Cipher {
	id: number

	start: Date
	started: boolean

	submission_delay: number // Seconds

	name?: string
	task_file?: string // URL
	hint?: string

	hint_publish_time?: Date
	hint_visible: boolean

	end: Date
	has_ended: boolean

	data: {
		solved: boolean
		after_hint: boolean
		attempts: number
	}
	submissions: Submission[]
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