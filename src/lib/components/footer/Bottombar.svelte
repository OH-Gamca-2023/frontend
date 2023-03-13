<script lang="ts">
	import { goto } from '$app/navigation'
	import { darkTheme } from '$lib/prefs'
	import Sponsors from '$lib/components/footer/Sponsors.svelte'
</script>

<div
	id="bottom-logo"
	class="h-80 flex w-full align-middle p-2 md:p-4 xl:p-8 bg-cover bg-center -z-50 sticky bottom-0"
	style="background-image: url('/assets/footer/background{$darkTheme ? '-dark' : ''}.jpg');"
>
	<div id="sponsors" class="min-w-1/3 max-w-1/2">
		<Sponsors />
	</div>
</div>
