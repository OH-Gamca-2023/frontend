import { clazzes, grades } from '$lib/state'
import type { Post, User } from '$lib/types'
import { PartialModel } from '$lib/utils/models'
import { get } from 'svelte/store'
import { categories, tags } from './data'

class PostModel extends PartialModel<Post> {
	constructor() {
		super(
			'posts',
			(data) => {
				const rawPost = data as any

				const author = {
					id: rawPost.author.id,
					username: rawPost.author.username,
					email: rawPost.author.email,
					first_name: rawPost.author.first_name,
					last_name: rawPost.author.last_name,
					clazz: get(clazzes)[rawPost.author.clazz],
					type: rawPost.author.type,
					microsoft_user: 'hidden',
					has_password: false,
				} as User

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
						return this.related_disciplines.map((d) => d.category)
					},
				} as Post
			},
			true,
			[tags, categories, grades, clazzes],
			'partial',
		)
	}
}
