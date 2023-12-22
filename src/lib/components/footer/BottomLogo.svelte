<script lang="ts">
	import { darkTheme } from '$lib/data/settings'
	import Sponsors from '$lib/components/footer/Sponsors.svelte'
</script>

<div class="h-56 p-2 flex w-full align-middle cf-bg sticky bottom-0" class:dark={$darkTheme}>
	<div
		id="sponsors"
		class="w-full h-full flex lmd:hidden flex-col m-2 z-10 text-zinc-950 dark:text-zinc-50 text-center overflow-y-hidden"
	>
		<span class="text-zinc-950 dark:text-zinc-50 font-bold text-2xl pb-2"> Naši sponzori: </span>
		<Sponsors />
	</div>
</div>
