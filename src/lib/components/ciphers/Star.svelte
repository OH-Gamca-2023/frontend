<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import Icon from '../Icon.svelte'

	export let rating = 0
	export let size = 'w-10 h-10'

	let dispatch = createEventDispatcher()
</script>

<div class="{size} relative">
	<Icon
		class="absolute inset-0 {size} {rating == 0.5 ? '' : 'hidden'} text-amber-500"
		icon="mdi:star-half-full"
	/>
	<Icon
		class="absolute inset-0 {size} {rating == 1 ? '' : 'hidden'} text-amber-500"
		icon="mdi:star"
	/>
	<Icon
		class="absolute inset-0 z-10 {size} {rating == 0 ? 'opacity-50' : ''}"
		icon="mdi:star-outline"
	/>
	<button
		class="absolute left-0 top-0 h-full w-1/2 z-20"
		on:mouseover={() => dispatch('star', { hover: true, rating: 0.5 })}
		on:click|preventDefault={() => dispatch('star', { hover: false, rating: 0.5 })}
	></button>
	<button
		class="absolute left-0 top-0 h-full w-full z-10"
		on:mouseover={() => dispatch('star', { hover: true, rating: 1 })}
		on:click|preventDefault={() => dispatch('star', { hover: false, rating: 1 })}
	></button>
</div>
