<script lang="ts">
	import { goto } from '$app/navigation'
	import { get, darkTheme } from '$lib/prefs'
	import Icon from '@iconify/svelte'
	import { fade, slide } from 'svelte/transition'
	import UserMenu from './UserMenu.svelte'

	const theme = get('theme')
</script>

<navbar
	class="h-14 p-2 flex flex-row items-center justify-between
        bg-gradient-to-b from-gray-100 to-gray-200
        dark:from-gray-800 dark:to-gray-900
        border-b border-gray-300 dark:border-gray-700
        text-gray-800 dark:text-gray-200 pl-4 pr-4
        shadow-md sticky top-0"
>
	<div id="left" class="flex flex-row items-center justify-start">
		<div id="home" transition:fade>
			<a
				href="/"
			>
				<Icon icon="carbon:home" class="h-6 w-6" />
			</a>
		</div>
		<div id="links">
			
		</div>
	</div>
	<div
		id="right"
		class="flex flex-row items-center justify-end divide-x
            divide-gray-300 dark:divide-gray-700
            [&>*]:pr-2 [&>*]:pl-2"
	>
		<UserMenu/>
		<div
			id="dark-mode"
			class="flex flex-col items-center justify-center cursor-pointer"
			transition:fade
			on:click={() => ($darkTheme ? ($theme = 'light') : ($theme = 'dark'))}
			on:keypress={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					$darkTheme ? ($theme = 'light') : ($theme = 'dark')
				}
			}}
		>
			{#if $darkTheme}
				<Icon icon="material-symbols:light-mode" class="h-6 w-6" />
			{:else}
				<Icon icon="material-symbols:dark-mode-rounded" class="h-6 w-6" />
			{/if}
		</div>
	</div></navbar
>
