import { clazzes, grades } from '$lib/state'
import type { Discipline, Post, User } from '$lib/types'
import { PartialModel } from '$lib/utils/models'
import { get } from 'svelte/store'
import { categories, tags } from './data'
import { disciplines } from './disciplines'

class PostModel extends PartialModel<Post> {
	constructor() {
		super(
			'posts',
			(data) => {
				const rawPost = data as any

				const author: Partial<User> = {
					id: rawPost.author.id,
					username: rawPost.author.username,
					clazz: get(clazzes)[rawPost.author.clazz],
					type: rawPost.author.type,
				}

				rawPost.related_disciplines.forEach((id: any) => disciplines.load(id))

				return {
					id: rawPost.id,
					title: rawPost.title,
					content: rawPost.content,
					author: author,
					date: rawPost.date,
					affected_grades: rawPost.affected_grades.map((grade: any) => get(grades)[grade.id]),
					tags: rawPost.tags.map((tag: any) => get(tags)[tag.id]),
					disable_comments: rawPost.disable_comments,

					get related_disciplines() {
						return rawPost.related_disciplines.map((id: any) => disciplines.get(id))
					},

					get discipline_categories() {
						return this.related_disciplines.map((d: Discipline) => d.category)
					},
				}
			},
			true,
			[tags, categories, grades, clazzes],
		)
	}
}

export const posts = new PostModel()