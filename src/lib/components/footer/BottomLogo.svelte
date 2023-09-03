<script lang="ts">
	import { darkTheme } from '$lib/data/settings'
	import Sponsors from '$lib/components/footer/Sponsors.svelte'
</script>

<div
	class="h-56 flex w-full align-middle p-2 md:p-4 xl:p-8 cf-bg -z-50 sticky bottom-0 justify-center md:justify-between"
	class:dark={$darkTheme}
>
	<div id="sponsors" class="w-full lmd:w-1/2 h-full flex flex-col m-2 xl:-mt-4 z-10">
		<div
			class="flex justify-center items-center text-zinc-950 dark:text-zinc-50 font-bold text-2xl pb-2"
		>
			Naši sponzori:
		</div>
		<Sponsors />
	</div>
	<img src="/assets/logos/vybuch/nobg_color.svg" alt="Logo" class="fixed w-screen -top-[250px]" />
</div>
