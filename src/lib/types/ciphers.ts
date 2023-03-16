export interface Cipher {
	id: number
	name: string

	start: number // Unix timestamp
	task_file: string // URL
	visible: boolean

	hint: string | null
	hint_type: 'file' | 'text' | null
	hint_publish_time: number | null // Unix timestamp
	hint_visible: boolean

	end: number // Unix timestamp
	has_ended: boolean
}
