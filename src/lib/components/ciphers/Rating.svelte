<script>
	import { createEventDispatcher } from 'svelte'
	import Star from './Star.svelte'

	let dispatch = createEventDispatcher()

	export let size = 'w-10 h-10'
	export let stars = 5
	export let rating = 0

	let displayRating = rating
</script>

<div
	class="flex h-min"
	on:mouseleave={() => (displayRating = rating)}
	role="radiogroup"
	tabindex="0"
>
	{#each Array(stars) as _, i}
		<Star
			{size}
			rating={Math.max(0, Math.min(displayRating - i, 1))}
			on:star={(e) => {
				displayRating = e.detail.rating + i
				if (!e.detail.hover) {
					rating = displayRating
					dispatch('rating', { rating })
				}
			}}
		/>
	{/each}
</div>
