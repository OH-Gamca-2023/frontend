import { getCipherSubmissions, type ErrorResponse } from '$lib/api'
import { clazzes, grades } from '$lib/api/models'
import type { Cipher } from '$lib/types'
import { LoadableModel } from '$lib/utils/models'

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
			submissions: [],
			data: rawData.data ? {
				solved: rawData.data.solved,
				after_hint: rawData.data.after_hint,
				attempts: rawData.data.attempts,
			} : null,
		} as Cipher

		if (rawData.hint_publish_time) {
			base.hint_publish_time = new Date(rawData.hint_publish_time)
		}

		if (base.started) {
			base.name = rawData.name
			base.task_file = rawData.task_file
		}

		if (base.hint_visible) {
			base.hint = rawData.hint_text
		}

		if (base.started) loadCipherSubmissions(base)

		return base
	},
	false,
	[clazzes, grades],
	'list',
	true,
	true,
)

export async function loadCipherSubmissions(cipher: Cipher) {
	const submissions = await getCipherSubmissions(cipher.id)
	if (submissions.error) {
		console.error(
			(submissions as ErrorResponse).status,
			(submissions as ErrorResponse).data,
		)
		return
	}
	if (!submissions.data) {
		console.error('No submissions data received for cipher', cipher.id)
		return
	}

	cipher.submissions = submissions.data.map((raw) => {
		return {
			...raw,
			time: new Date(raw.time),
		}
	})
	cipher.submissions.sort((a, b) => b.time.getTime() - a.time.getTime())
	ciphers.set(cipher.id, cipher)
}
