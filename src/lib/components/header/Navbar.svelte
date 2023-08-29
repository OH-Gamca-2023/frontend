<script lang="ts">
	import { setValue, settings } from '$lib/data/settings'
	import { categories } from '$lib/api/models'
	import Icon from '$lib/components/Icon.svelte'
	import { fade, slide } from 'svelte/transition'
	import Hamburger from './Hamburger.svelte'
	import UserMenu from './UserMenu.svelte'

	let categoriesOpen = false
	let sidebarOpen = false

	$: categoriesOpen = sidebarOpen && false

	$: categoriesIterable = Object.values($categories)
</script>

<svelte:window on:resize={() => window.innerWidth > 860 && (sidebarOpen = false)} />

<navbar
	class="min-h-14 p-2 flex
        bg-gradient-to-b from-gray-100 to-gray-200
        dark:from-gray-800 dark:to-gray-900
        border-b border-gray-300 dark:border-gray-700
        text-gray-800 dark:text-gray-200 pl-4 pr-4
        shadow-md sticky top-0 z-50"
>
	<div class="h-10" />
	<div id="computer" class="hidden lmd:flex items-center justify-between flex-grow flex-wrap">
		<div id="left" class="flex items-center justify-start">
			<div id="home">
				<a href="/">
					<Icon icon="carbon:home" class="h-6 w-6" />
				</a>
			</div>
			<div
				id="links"
				class="flex justify-start pl-5 [&>*]:pr-2 [&>*]:pl-2 divide-gray-300 dark:divide-gray-700 divide-x"
			>
				<div>
					<a
						href="/news"
						class="flex gap-1 hover:bg-gray-300 dark:hover:bg-gray-800 rounded-md p-1"
					>
						<Icon icon="tabler:news" class="h-6 w-6" />
						<span>Novinky</span>
					</a>
				</div>
				<div class="relative">
					<a class="flex cursor-pointer rounded-md p-1 relative" href="/disciplines">
						<Icon icon="iconamoon:category" class="h-6 w-6 mr-1" />
						<span>Disciplíny</span>
						{#await categories.load()}
							<Icon icon="mdi:loading" class="w-6 h-6 animate-spin opacity-50 ml-2" />
						{:then}
							<button on:click|preventDefault={() => (categoriesOpen = !categoriesOpen)}>
								<Icon
									icon="tabler:chevron-left"
									class="ml-2 h-6 w-6 transform transition-transform duration-500 ease-in-out {categoriesOpen
										? '-rotate-90'
										: ''}"
								/>
							</button>
						{/await}
					</a>
					<div class="absolute -bottom-3 left-0 right-0">
						{#if categoriesOpen}
							<div
								class="flex flex-col gap-1 rounded-b-lg p-2 shadow-md absolute left-0 right-0
								from-gray-200 to-gray-300 dark:from-gray-900 dark:to-gray-950 z-10
								bg-gradient-to-b border border-gray-300 dark:border-gray-700 border-t-0"
								transition:slide={{ duration: 500 }}
							>
								{#each categoriesIterable as category}
									<a
										href={`/disciplines/categories/${category.id}`}
										class="flex gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-1 items-center"
									>
										<Icon icon={category.icon} class="h-6 w-6" />
										<span>{category.name}</span>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				<div>
					<a
						href="/results"
						class="flex gap-1 hover:bg-gray-300 dark:hover:bg-gray-800 rounded-md p-1"
					>
						<Icon icon="material-symbols:format-list-bulleted-rounded" class="h-6 w-6" />
						<span>Výsledky</span>
					</a>
				</div>
				<div>
					<a
						href="/calendar"
						class="flex gap-1 hover:bg-gray-300 dark:hover:bg-gray-800 rounded-md p-1"
					>
						<Icon icon="material-symbols:calendar-month-rounded" class="h-6 w-6" />
						<span>Kalendár</span>
					</a>
				</div>
				<div>
					<a
						href="/ciphers"
						class="flex gap-1 hover:bg-gray-300 dark:hover:bg-gray-800 rounded-md p-1"
					>
						<Icon icon="tabler:puzzle" class="h-6 w-6" style="scale: -1 1;" />
						<span>Šifrovačka</span>
					</a>
				</div>
			</div>
		</div>
		<div
			id="right"
			class="flex items-center justify-end divide-x
				divide-gray-300 dark:divide-gray-700
				[&>*]:pr-2 [&>*]:pl-2 flex-grow"
		>
			<UserMenu />
			<button
				id="dark-mode"
				class="flex flex-col items-center justify-center cursor-pointer"
				transition:fade|global
				on:click={() => setValue('darkMode', !$settings.darkMode.value)}
			>
				{#if $settings.darkMode.value}
					<Icon icon="material-symbols:light-mode" class="h-6 w-6" />
				{:else}
					<Icon icon="material-symbols:dark-mode-rounded" class="h-6 w-6" />
				{/if}
			</button>
		</div>
	</div>
	<div id="mobile" class="flex justify-between items-center w-full lmd:hidden">
		<button
			id="hamburger"
			class="flex items-center justify-start
							bg-gradient-to-br from-gray-200 to-zinc-200
							dark:from-gray-800 dark:to-slate-800
							border border-gray-300 dark:border-gray-700
							text-gray-800 dark:text-gray-200
							shadow-inner rounded-md py-1 px-2"
			on:click={() => (sidebarOpen = !sidebarOpen)}
		>
			<Hamburger open={sidebarOpen} class="h-6 w-6" />
		</button>
		<div
			id="right"
			class="flex items-center justify-end divide-x
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
				[&>*]:w-full [&>*]:py-3 [&>*]:px-4 divide-y
				divide-gray-300 dark:divide-gray-700"
			transition:slide|global
		>
			<div class="flex justify-between">
				<a
					id="home"
					href="/"
					class="flex items-center justify-start px-2 -py-1"
					on:click={() => (sidebarOpen = !sidebarOpen)}
				>
					<Icon icon="tabler:home" class="h-7 w-7 cursor-pointer" />
				</a>

				<button
					id="dark-mode"
					class="flex flex-col items-center justify-center cursor-pointer"
					transition:fade|global
					on:click={() => setValue('darkMode', !$settings.darkMode.value)}
				>
					{#if $settings.darkMode.value}
						<Icon icon="material-symbols:light-mode" class="h-6 w-6" />
					{:else}
						<Icon icon="material-symbols:dark-mode-rounded" class="h-6 w-6" />
					{/if}
				</button>
			</div>
			<a href="/news" class="flex gap-1" on:click={() => (sidebarOpen = !sidebarOpen)}>
				<Icon icon="tabler:news" class="h-6 w-6" />
				<span>Novinky</span>
			</a>
			<div class="flex flex-col gap-1">
				<div class="flex gap-1 cursor-pointer">
					<button
						class="contents"
						on:click={() => categories.isLoaded && (categoriesOpen = !categoriesOpen)}
					>
						{#await categories.load()}
							<Icon icon="mdi:loading" class="w-6 h-6 animate-spin ml-2" />
						{:then}
							<Icon
								icon="tabler:chevron-right"
								class="h-6 w-6  transform transition-transform duration-500 ease-in-out {categoriesOpen
									? 'rotate-90'
									: ''}"
							/>
						{/await}
					</button>
					<a href="/disciplines" class="flex gap-1" on:click={() => (sidebarOpen = !sidebarOpen)}>
						<Icon icon="bxs:category-alt" class="h-6 w-6" />
						Disciplíny
					</a>
				</div>
				{#if categoriesOpen}
					<div class="flex flex-col space-y-2" transition:slide>
						<div
							class="pt-2 px-8 divide-y
							divide-gray-300 dark:divide-gray-700"
						>
							{#each categoriesIterable as category}
								<a
									href={`/disciplines/categories/${category.id}`}
									class="flex p-1 pr-0 gap-1 items-center"
									on:click={() => (sidebarOpen = !sidebarOpen)}
								>
									<Icon icon={category.icon} class="h-5 w-5" />
									<span>{category.name}</span>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<a href="/results" class="flex gap-1" on:click={() => (sidebarOpen = !sidebarOpen)}>
				<Icon icon="material-symbols:format-list-bulleted-rounded" class="h-6 w-6" />
				<span>Výsledky</span>
			</a>
			<a href="/calendar" class="flex gap-1" on:click={() => (sidebarOpen = !sidebarOpen)}>
				<Icon icon="material-symbols:calendar-month-rounded" class="h-6 w-6" />
				<span>Kalendár</span>
			</a>
			<a href="/ciphers" class="flex gap-1" on:click={() => (sidebarOpen = !sidebarOpen)}>
				<Icon icon="tabler:puzzle" class="h-6 w-6" style="scale: -1 1;" />
				<span>Šifrovačka</span>
			</a>
		</div>
	{/if}
</div>
