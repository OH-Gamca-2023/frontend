<script lang="ts">
	import { goto } from '$app/navigation'
	import { get, darkTheme } from '$lib/prefs'
	import { categories } from '$lib/state'
	import Icon from '@iconify/svelte'
	import { fade, slide } from 'svelte/transition'
	import Spinner from '../Spinner.svelte'
	import Hamburger from './Hamburger.svelte'
	import UserMenu from './UserMenu.svelte'

	const theme = get('theme')

	let categoriesOpen = false
	let sidebarOpen = false

	$: categoriesOpen = sidebarOpen && false
</script>

<svelte:window on:resize={() => window.innerWidth > 860 && (sidebarOpen = false)} />

<navbar
	class="h-14 p-2 flex flex-row
        bg-gradient-to-b from-gray-100 to-gray-200
        dark:from-gray-800 dark:to-gray-900
        border-b border-gray-300 dark:border-gray-700
        text-gray-800 dark:text-gray-200 pl-4 pr-4
        shadow-md sticky top-0"
>
	<div id="computer" class="hidden lmd:flex flex-row items-center justify-between flex-1 w-full">
		<div id="left" class="flex flex-row items-center justify-start">
			<div id="home" transition:fade>
				<a href="/">
					<Icon icon="carbon:home" class="h-6 w-6" />
				</a>
			</div>
			<div
				id="links"
				class="flex flex-row justify-start pl-5 [&>*]:pr-2 [&>*]:pl-2 divide-gray-300 dark:divide-gray-700 divide-x"
			>
				<a
					href="/news"
					class="flex flex-row space-x-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md p-1"
				>
					<Icon icon="tabler:news" class="h-6 w-6" />
					<span>Novinky</span>
				</a>
				<div
					class="flex flex-row space-x-1 cursor-pointer rounded-md p-1"
					on:click={() => (categoriesOpen = !categoriesOpen)}
					on:keypress={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							categoriesOpen = !categoriesOpen
						}
					}}
				>
					<Icon icon="bxs:category-alt" class="h-6 w-6" />
					<span>Kategórie</span>
					<Icon
						icon="tabler:chevron-left"
						class="h-6 w-6 transform transition-transform duration-500 ease-in-out {categoriesOpen
							? '-rotate-90'
							: ''}"
					/>
				</div>
				<a
					href="/results"
					class="flex flex-row space-x-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md p-1"
				>
					<Icon icon="material-symbols:format-list-bulleted-rounded" class="h-6 w-6" />
					<span>Výsledky</span>
				</a>
				<a
					href="/calendar"
					class="flex flex-row space-x-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md p-1"
				>
					<Icon icon="material-symbols:calendar-month-rounded" class="h-6 w-6" />
					<span>Kalendár</span>
				</a>
				<a
					href="/gallery"
					class="flex flex-row space-x-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md p-1"
				>
					<Icon icon="tabler:photo" class="h-6 w-6" />
					<span>Galéria</span>
				</a>
			</div>
		</div>
		<div
			id="right"
			class="flex flex-row items-center justify-end divide-x
				divide-gray-300 dark:divide-gray-700
				[&>*]:pr-2 [&>*]:pl-2"
		>
			<UserMenu />
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
		</div>
	</div>
	<div id="mobile" class="flex flex-row justify-between items-center w-full lmd:hidden">
		<div
			id="hamburger"
			class="flex flex-row items-center justify-start
							bg-gradient-to-br from-gray-200 to-zinc-200
							dark:from-gray-800 dark:to-slate-800
							border border-gray-300 dark:border-gray-700
							text-gray-800 dark:text-gray-200
							shadow-inner rounded-md py-1 px-2"
			on:click={() => (sidebarOpen = !sidebarOpen)}
			on:keypress={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					sidebarOpen = !sidebarOpen
				}
			}}
		>
			<Hamburger open={sidebarOpen} class="h-6 w-6" />
		</div>
		<div
			id="right"
			class="flex flex-row items-center justify-end divide-x
				divide-gray-300 dark:divide-gray-700
				[&>*]:pr-2 [&>*]:pl-2"
		>
			<UserMenu />
		</div>
	</div>
</navbar>
<div id="sidebar-wrapper" class="sticky top-0 z-50 w-full h-0">
	{#if sidebarOpen}
		<div
			id="sidebar"
			class="h-min w-full left-0 z-50
				bg-gradient-to-br from-gray-200 to-zinc-200
				dark:from-gray-800 dark:to-slate-800
				text-gray-800 dark:text-gray-200
				shadow-md sticky top-0 flex flex-col justify-start items-start
				[&>*]:w-full [&>*]:py-4 [&>*]:px-4 divide-y
				divide-gray-300 dark:divide-gray-700"
			transition:slide
		>
			<div class="flex flex-row justify-between">
				<a
					id="home"
					href="/"
					class="flex flex-row items-center justify-start px-2 -py-1"
					on:click={() => (sidebarOpen = !sidebarOpen)}
					on:keypress={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							sidebarOpen = !sidebarOpen
						}
					}}
				>
					<Icon icon="tabler:home" class="h-7 w-7 cursor-pointer" />
				</a>

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
			</div>
			<a
				href="/news"
				class="flex flex-row space-x-1"
				on:click={() => (sidebarOpen = !sidebarOpen)}
				on:keypress={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						sidebarOpen = !sidebarOpen
					}
				}}
			>
				<Icon icon="tabler:news" class="h-6 w-6" />
				<span>Novinky</span>
			</a>
			<div class="flex flex-col space-y-1">
				<div
					class="flex flex-row space-x-1 cursor-pointer"
					on:click={() => (categoriesOpen = !categoriesOpen)}
					on:keypress={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							categoriesOpen = !categoriesOpen
						}
					}}
				>
					<Icon
						icon="tabler:chevron-right"
						class="h-6 w-6  transform transition-transform duration-500 ease-in-out {categoriesOpen
							? 'rotate-90'
							: ''}"
					/>
					<Icon icon="bxs:category-alt" class="h-6 w-6" />
					<span>Kategórie</span>
				</div>
				{#if categoriesOpen}
					<div class="flex flex-col space-y-2" transition:slide>
						{#await categories.loaded}
							<div class="flex flex-row space-x-1 pl-8 pt-2">
								<Spinner class="h-6 w-6" />
								<span>Načítavam...</span>
							</div>
						{:then}
							<div
								class="pt-2 px-8 divide-y
								divide-gray-300 dark:divide-gray-700"
								transition:slide
							>
								{#each $categories as category}
									<a
										href={`/category/${category.id}`}
										class="flex flex-row p-1 pr-0"
										on:click={() => (sidebarOpen = !sidebarOpen)}
										on:keypress={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												sidebarOpen = !sidebarOpen
											}
										}}
										transition:fade
									>
										<span>{category.name}</span>
									</a>
								{/each}
							</div>
						{/await}
					</div>
				{/if}
			</div>
			<a
				href="/results"
				class="flex flex-row space-x-1"
				on:click={() => (sidebarOpen = !sidebarOpen)}
				on:keypress={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						sidebarOpen = !sidebarOpen
					}
				}}
			>
				<Icon icon="material-symbols:format-list-bulleted-rounded" class="h-6 w-6" />
				<span>Výsledky</span>
			</a>
			<a
				href="/calendar"
				class="flex flex-row space-x-1"
				on:click={() => (sidebarOpen = !sidebarOpen)}
				on:keypress={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						sidebarOpen = !sidebarOpen
					}
				}}
			>
				<Icon icon="material-symbols:calendar-month-rounded" class="h-6 w-6" />
				<span>Kalendár</span>
			</a>
			<a
				href="/gallery"
				class="flex flex-row space-x-1"
				on:click={() => (sidebarOpen = !sidebarOpen)}
				on:keypress={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						sidebarOpen = !sidebarOpen
					}
				}}
			>
				<Icon icon="tabler:photo" class="h-6 w-6" />
				<span>Galéria</span>
			</a>
		</div>
	{/if}
</div>