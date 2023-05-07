<script lang="ts">
	import { darkTheme } from '$lib/data/prefs'
	import Sponsors from '$lib/components/footer/Sponsors.svelte'
</script>

<div
	class="h-56 flex w-full align-middle p-2 md:p-4 xl:p-8 bg-cover bg-center -z-50 sticky bottom-0 justify-center md:justify-between"
	style="background-image: url('/assets/footer/background{$darkTheme ? '-dark' : ''}.jpg');"
>
	<div id="sponsors" class="w-full lmd:w-1/2 h-full flex flex-col m-2 xl:-mt-4">
		<div class="flex flex-row justify-center items-center text-white font-bold text-2xl pb-2">
			Naši sponzori:
		</div>
		<Sponsors />
	</div>
</div>
