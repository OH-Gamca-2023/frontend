import { getCipherSubmissions, type ErrorResponse } from '$lib/api'
import { clazzes, grades } from '$lib/api/models'
import type { Cipher, Submission } from '$lib/types'
import { LoadableModel } from '$lib/utils/models'

const submissionPromiseCache = new Map<number, Promise<Submission[]>>()

export const ciphers = new LoadableModel<Cipher>(
	'ciphers',
	(raw) => {
		const rawData = raw as any

		const base = {
			id: rawData.id,
			start: new Date(rawData.start),
			started: rawData.started,
			submission_delay: rawData.submission_delay,
			hint_visible: rawData.hint_visible,
			end: new Date(rawData.end),
			has_ended: rawData.has_ended,
			get submissions() {
				if (!this.started) return Promise.resolve([])
				if (!submissionPromiseCache.has(this.id)) {
					submissionPromiseCache.set(this.id, loadCipherSubmissions(this.id))
				}
				return submissionPromiseCache.get(this.id)
			},
			data: rawData.data
				? {
						solved: rawData.data.solved,
						after_hint: rawData.data.after_hint,
						attempts: rawData.data.attempts,
				  }
				: null,
		} as Cipher

		if (rawData.hint_publish_time) {
			base.hint_publish_time = new Date(rawData.hint_publish_time)
		}

		if (base.started) {
			base.name = rawData.name
			base.task_file = rawData.task_file
			base.task_file_ext = rawData.task_file_ext
		}

		if (base.hint_visible) {
			base.hint = rawData.hint_text
		}

		return base
	},
	false,
	[clazzes, grades],
	'list',
	true,
	true,
)

export async function loadCipherSubmissions(id: number): Promise<Submission[]> {
	const submissions = await getCipherSubmissions(id)
	if (submissions.error) {
		console.error((submissions as ErrorResponse).status, (submissions as ErrorResponse).data)
		throw new Error(
			`Error loading submissions for cipher ${id}: ${(submissions as ErrorResponse).data?.message}`,
		)
	}
	if (!submissions.data) {
		console.error('No submissions data received for cipher', id)
		throw new Error('No submissions data received for cipher ' + id)
	}

	const parsedSubmissions = submissions.data.map((raw) => {
		return {
			...raw,
			time: new Date(raw.time),
		} as Submission
	})
	parsedSubmissions.sort((a, b) => b.time.getTime() - a.time.getTime())
	return parsedSubmissions
}

export async function updateCipherSubmissions(id: number) {
	const promise = loadCipherSubmissions(id)
	submissionPromiseCache.set(id, promise)
	return promise
}
