<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import BottomLogo from './BottomLogo.svelte'
	import { devOptionsEnabled } from '$lib/data/settings'
</script>

<div
	class="h-14 p-2 flex flex-row justify-between
        bg-gradient-to-b from-gray-100 to-gray-200
        dark:from-gray-800 dark:to-gray-900
        border-t border-gray-300 dark:border-gray-700
        text-gray-800 dark:text-gray-200 pl-4 pr-4
        shadow-md-top sticky bottom-0"
>
	<div class="flex flex-row items-center">
		{#if devOptionsEnabled}
			<a href="/dev">
				<Icon icon="bi:code" class="h-5 w-5" />
			</a>
			<a href="/dev/rss" class="ml-2">
				<Icon icon="material-symbols:rss-feed" class="h-5 w-5" />
			</a>
			<a href="/dev/discord" class="ml-2">
				<Icon icon="material-symbols:webhook" class="h-5 w-5" />
			</a>
		{/if}
	</div>
	<div class="flex flex-row items-center">
		<a
			href="https://www.youtube.com/@ohgamca2023"
			target="_blank"
			rel="noopener noreferrer"
			class="mr-4"
		>
			<Icon icon="bi:youtube" class="h-7 w-7" />
		</a>
		<a href="https://www.instagram.com/ohgamca2023" target="_blank" rel="noopener noreferrer">
			<Icon icon="bi:instagram" class="h-6 w-6" />
		</a>
	</div>
</div>
<BottomLogo />
