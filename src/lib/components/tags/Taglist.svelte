<script lang="ts">
	import type { Discipline, Post } from '$lib/types'
	import Tag from './Tag.svelte'

	export let post: Post | undefined = undefined
	export let discipline: Discipline | undefined = undefined
	export let tags: string[] | undefined = undefined

	export let wrapper = true
</script>

{#if wrapper}
	<div class="flex flex-row pt-2 flex-wrap gap-2 {$$props.class}">
		<svelte:self {post} {discipline} {tags} wrapper={false} />
	</div>
{:else}
	{#if post}
		{#each post.discipline_categories as category}
			<Tag name={category?.name} styleClass={category?.calendarClass} />
		{/each}
		{#each post.affected_grades as grade}
			<Tag name={grade?.name} />
		{/each}
		{#each post.tags as tag}
			<Tag name={tag?.name} />
		{/each}
	{/if}
	{#if discipline}
		<Tag name={discipline.category?.name} styleClass={discipline.category?.calendarClass} />
		{#each discipline.target_grades as grade}
			<Tag name={grade?.name} />
		{/each}
	{/if}
	{#if tags}
		{#each tags as tag}
			<Tag name={tag} />
		{/each}
	{/if}
{/if}
