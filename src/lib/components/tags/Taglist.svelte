<script lang="ts">
	import type { Discipline, Post } from '$lib/types'
	import Tag from './Tag.svelte'

	export let post: Post | undefined = undefined
	export let discipline: Discipline | undefined = undefined
	export let tags: string[] | undefined = undefined

	export let wrapper = true

	export let alwaysBig = false
</script>

{#if wrapper}
	<div class="flex pt-2 flex-wrap gap-2 {$$props.class}">
		<svelte:self {post} {discipline} {tags} wrapper={false} {alwaysBig} />
	</div>
{:else}
	{#if post}
		{#each post.discipline_categories as category}
			<Tag name={category?.name} styleClass={category?.calendarClass} {alwaysBig} />
		{/each}
		{#each post.affected_grades as grade}
			<Tag name={grade?.name} {alwaysBig} />
		{/each}
		{#each post.tags as tag}
			<Tag name={tag?.name} {alwaysBig} />
		{/each}
	{/if}
	{#if discipline}
		<Tag
			name={discipline.category?.name}
			styleClass={discipline.category?.calendarClass}
			{alwaysBig}
		/>
		{#each discipline.target_grades as grade}
			<Tag name={grade?.name} {alwaysBig} />
		{/each}
	{/if}
	{#if tags}
		{#each tags as tag}
			<Tag name={tag} {alwaysBig} />
		{/each}
	{/if}
{/if}
