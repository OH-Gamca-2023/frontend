<script lang="ts">
	import { darkTheme } from '$lib/data/settings'
</script>

<div
	id="top-logo"
	class="h-40 flex w-full align-middle justify-center lg:justify-start p-2 md:p-4 xl:p-8 bg-cover bg-center fixed -z-20"
	style="background-image: url('/assets/header/background{$darkTheme ? '-dark' : ''}.jpg');"
>
	<div class="flex space-x-10 items-center">
		<img
			id="top-logo-image"
			src="/assets/header/horcica.jpg"
			alt="Logo"
			class="h-full cursor-pointer rounded-full"
		/>
		<span
			id="top-logo-text"
			class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white cursor-pointer"
		>
			OH Gamča 2023
		</span>
	</div>
</div>

<div class="h-40" id="spacer" />
