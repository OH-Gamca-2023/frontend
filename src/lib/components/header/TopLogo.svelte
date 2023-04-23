<script lang="ts">
	import { goto } from '$app/navigation'
	import { darkTheme } from '$lib/prefs'
</script>

<div
	id="top-logo"
	class="h-40 flex w-full align-middle justify-center lg:justify-start p-2 md:p-4 xl:p-8 bg-cover bg-center fixed -z-20"
	style="background-image: url('/assets/header/background{$darkTheme ? '-dark' : ''}.jpg');"
>
	<div class="flex flex-row space-x-2">
		<img
			id="top-logo-image"
			src="/assets/header/logo{$darkTheme ? '-dark' : ''}.svg"
			alt="Logo"
			class="h-full cursor-pointer"
			on:click={() => goto('/')}
			on:keypress={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					goto('/')
				}
			}}
		/>
		<img
			id="top-logo-text"
			src="/assets/header/text{$darkTheme ? '-dark' : ''}.svg"
			alt="Logo"
			class="h-1/2 w-auto self-center cursor-pointer"
			on:click={() => goto('/')}
			on:keypress={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					goto('/')
				}
			}}
		/>
	</div>
</div>

<div class="h-40" id="spacer" />
