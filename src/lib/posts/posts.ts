import { clazzes, grades } from '$lib/state'
import type { Discipline, Post, User } from '$lib/types'
import { PartialModel } from '$lib/utils/models'
import { derived } from 'svelte/store'
import { categories, tags } from './data'
import { disciplines } from './disciplines'

class PostModel extends PartialModel<Post> {
	constructor() {
		super(
			'posts',
			(data) => {
				const rawPost = data as any

				const author: Partial<User> = rawPost.author
					? {
							id: rawPost.author.id,
							username: rawPost.author.username,
							first_name: rawPost.author.first_name,
							last_name: rawPost.author.last_name,
							type: rawPost.author.type,
					  }
					: {
							id: -1,
							username: 'admin',
							first_name: 'Administrátor',
							last_name: '',
							type: 'admin',
					  }

				rawPost.related_disciplines.forEach((id: any) => disciplines.load(id))

				return {
					id: rawPost.id,
					title: rawPost.title,
					content: rawPost.content,
					author: author,
					date: rawPost.date,
					affected_grades: rawPost.affected_grades.map((id: any) => grades.get(id)),
					tags: rawPost.tags.map((id: any) => tags.get(id)),
					disable_comments: rawPost.disable_comments,

					get related_disciplines() {
						return rawPost.related_disciplines.map((id: any) => disciplines.get(id))
					},

					get discipline_categories() {
						return this.related_disciplines.map((d: Discipline) => d?.category)
					},
				}
			},
			true,
			[tags, categories, grades, clazzes],
		)
	}

	public get postList() {
		return derived(this, ($posts) => {
			return Object.values($posts).sort((a, b) => b.date - a.date)
		})
	}
}

export const posts = new PostModel()

export const postList = posts.postList
