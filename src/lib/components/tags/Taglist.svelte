<script lang="ts">
	import type { Category, Discipline, Post } from '$lib/types'
	import Tag from './Tag.svelte'

	export let post: Post | undefined = undefined
	export let discipline: Partial<Discipline> | undefined = undefined
	export let tags: string[] | undefined = undefined
	export let categories: Category[] | undefined = undefined

	export let wrapper = true

	export let alwaysBig = false
	export let alwaysSmall = false
	export let xs = false
</script>

{#if wrapper}
	<div class="flex pt-2 flex-wrap gap-2 {$$props.class}">
		<svelte:self {post} {discipline} {tags} wrapper={false} {alwaysBig} {alwaysSmall} {xs} />
		<slot />
	</div>
{:else}
	{#if post}
		{#each post.discipline_categories as category}
			<Tag
				name={category?.name}
				styleClass={category?.calendarClass}
				{alwaysBig}
				{alwaysSmall}
				{xs}
			/>
		{/each}
		{#each post.affected_grades as grade}
			<Tag name={grade?.name} {alwaysBig} {alwaysSmall} {xs} />
		{/each}
		{#each post.tags as tag}
			<Tag name={tag?.name} {alwaysBig} {alwaysSmall} {xs} />
		{/each}
	{/if}
	{#if discipline}
		{#if discipline.category}
			<Tag
				name={discipline.category?.name}
				styleClass={discipline.category?.calendarClass}
				{alwaysBig}
				{alwaysSmall}
				{xs}
			/>
		{/if}
		{#each discipline.target_grades ?? [] as grade}
			<Tag name={grade?.name} {alwaysBig} {alwaysSmall} {xs} />
		{/each}
	{/if}
	{#if tags}
		{#each tags as tag}
			<Tag name={tag} {alwaysBig} {alwaysSmall} {xs} />
		{/each}
	{/if}
	{#if categories}
		{#each categories as category}
			<Tag
				name={category?.name}
				styleClass={category?.calendarClass}
				{alwaysBig}
				{alwaysSmall}
				{xs}
			/>
		{/each}
	{/if}
	<slot />
{/if}
