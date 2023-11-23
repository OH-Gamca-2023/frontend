import { clazzes, grades } from '$lib/api/models'
import type { Category, Discipline, Post, User } from '$lib/types'
import { PartialModel } from '$lib/utils/models'
import { derived } from 'svelte/store'
import { categories, tags } from '$lib/api/models/generic'
import { disciplines } from './disciplines'

class PostModel extends PartialModel<Post> {
	constructor() {
		super(
			'posts',
			(data) => {
				const rawPost = data as any

				const author: Partial<User> = rawPost.author
					? rawPost.author
					: {
							id: -1,
							username: 'admin',
							first_name: 'Administrátor',
							last_name: '',
							type: 'admin',
					  }

				Promise.all(rawPost.related_disciplines.map((id: any) => disciplines.loadSingle(id, true))).then(() => {
					this.triggerUpdated()
				})

				return {
					id: rawPost.id,
					title: rawPost.title,
					content: rawPost.content,
					safe: rawPost.safe,
					redirect: rawPost.redirect || null,
					author: author,
					date: new Date(rawPost.date),
					get affected_grades() {
						return rawPost.affected_grades.map((id: any) => grades.get(id))
					},
					get tags() {
						return rawPost.tags.map((id: any) => tags.get(id))
					},

					get related_disciplines() {
						return rawPost.related_disciplines.map((id: any) => disciplines.get(id))
					},

					get discipline_categories() {
						const categories = this.related_disciplines.map((d: Discipline) => d?.category) as Category[]
						return categories.filter((c, i) => categories.indexOf(c) === i)
					},
				}
			},
			true,
			[tags, categories, grades, clazzes],
		)
	}

	public get postList() {
		return derived(this, ($posts) => {
			return Object.values($posts).sort((a, b) => b.date.getTime() - a.date.getTime())
		})
	}
}

export const posts = new PostModel()

export const postList = posts.postList
