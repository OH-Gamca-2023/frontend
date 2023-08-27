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

	function handleBodyClick(event: MouseEvent) {
		if (!sidebarOpen && !(event.target as HTMLElement).closest('#categories')) {
			categoriesOpen = false
		}
	}
</script>

<svelte:window on:resize={() => window.innerWidth > 860 && (sidebarOpen = false)} />
<svelte:body on:click={handleBodyClick} />

<navbar
	class="h-14 p-2 flex
        bg-gradient-to-b from-zinc-100 to-zinc-200
        dark:from-zinc-800 dark:to-zinc-900
        border-b border-zinc-300 dark:border-zinc-700
        text-zinc-800 dark:text-zinc-200 pl-4 pr-4
        shadow-md sticky top-0 z-50"
>
	<div id="computer" class="hidden lmd:flex items-center justify-between flex-1 w-full">
		<div id="left" class="flex items-center justify-start">
			<div id="home" transition:fade>
				<a href="/">
					<Icon icon="mdi:home-outline" class="h-7 w-7" />
				</a>
			</div>
			<div
				id="links"
				class="flex justify-start pl-5 [&>*]:pr-2 [&>*]:pl-2 divide-zinc-300 dark:divide-zinc-700 divide-x"
			>
				<div>
					<a
						href="/news"
						class="flex space-x-1 hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded-md p-1"
					>
						<Icon icon="tabler:news" class="h-6 w-6" />
						<span>Novinky</span>
					</a>
				</div>
				<div class="relative" id="categories">
					<button
						class="flex space-x-1 cursor-pointer rounded-md p-1 relative"
						on:click={() => (categoriesOpen = !categoriesOpen)}
					>
						<Icon icon="iconamoon:category" class="h-6 w-6" />
						<span>Kategórie</span>
						{#await categories.load()}
							<Icon icon="mdi:loading" class="w-6 h-6 animate-spin opacity-50 ml-2" />
						{:then}
							<Icon
								icon="tabler:chevron-left"
								class="h-6 w-6 transform transition-transform duration-500 ease-in-out {categoriesOpen
									? '-rotate-90'
									: ''}"
							/>
						{/await}
					</button>
					<div class="absolute -bottom-3 left-0 right-0">
						{#if categoriesOpen}
							<div
								class="flex flex-col space-y-1 rounded-b-lg p-2 shadow-md absolute left-0 right-0
								from-zinc-200 to-zinc-300 dark:from-zinc-900 dark:to-zinc-950 z-10
								bg-gradient-to-b border border-zinc-300 dark:border-zinc-700 border-t-0"
								style="top: -1px"
								transition:slide={{ duration: 500 }}
							>
								{#each categoriesIterable as category}
									<a
										href={`/disciplines/categories/${category.id}`}
										class="flex space-x-1 hover:bg-zinc-100 dark:hover:bg-zinc-750 rounded-md p-1"
									>
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
						class="flex space-x-1 hover:bg-zinc-300 dark:hover:bg-zinc-750 rounded-md p-1"
					>
						<Icon icon="mdi:format-list-numbered" class="h-6 w-6" />
						<span>Výsledky</span>
					</a>
				</div>
				<div>
					<a
						href="/calendar"
						class="flex space-x-1 hover:bg-zinc-300 dark:hover:bg-zinc-750 rounded-md p-1"
					>
						<Icon icon="mdi:calendar-month" class="h-6 w-6" />
						<span>Kalendár</span>
					</a>
				</div>
				<div>
					<a
						href="/ciphers"
						class="flex space-x-1 hover:bg-zinc-300 dark:hover:bg-zinc-750 rounded-md p-1"
					>
						<Icon icon="mdi:puzzle-outline" class="h-6 w-6 -mt-[1px] " />
						<span>Šifrovačka</span>
					</a>
				</div>
			</div>
		</div>
		<div
			id="right"
			class="flex items-center justify-end divide-x
				divide-zinc-300 dark:divide-zinc-700
				[&>*]:pr-2 [&>*]:pl-2"
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
				   bg-gradient-to-br border border-zinc-300
				   dark:border-zinc-700 shadow-inner rounded-md py-1 px-2"
			on:click={() => (sidebarOpen = !sidebarOpen)}
		>
			<Hamburger open={sidebarOpen} class="h-6 w-6" />
		</button>
		<div
			id="right"
			class="flex items-center justify-end divide-x
				divide-zinc-300 dark:divide-zinc-700
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
				bg-gradient-to-br bg-zinc-200 dark:bg-zinc-800
				text-zinc-800 dark:text-zinc-200 shadow-md
				sticky top-0 flex flex-col justify-start items-start
				[&>*]:w-full [&>*]:py-3 [&>*]:px-4 divide-y
				divide-zinc-300 dark:divide-zinc-700"
			transition:slide
		>
			<div class="flex justify-between">
				<a
					id="home"
					href="/"
					class="flex items-center justify-start px-2 -py-1"
					on:click={() => (sidebarOpen = !sidebarOpen)}
				>
					<Icon icon="mdi:home-outline" class="h-7 w-7 cursor-pointer" />
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
			<a href="/news" class="flex space-x-1" on:click={() => (sidebarOpen = !sidebarOpen)}>
				<Icon icon="tabler:news" class="h-6 w-6" />
				<span>Novinky</span>
			</a>
			<div class="flex flex-col space-y-1">
				<button
					class="flex space-x-1 cursor-pointer"
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
					<Icon icon="iconamoon:category" class="h-6 w-6" />
					<span>Kategórie</span>
				</button>
				{#if categoriesOpen}
					<div class="flex flex-col space-y-2" transition:slide|global>
						<div
							class="pt-2 px-8 divide-y
							divide-zinc-300 dark:divide-zinc-700"
						>
							{#each categoriesIterable as category}
								<a
									href={`/disciplines/categories/${category.id}`}
									class="flex p-1 pr-0"
									on:click={() => (sidebarOpen = !sidebarOpen)}
								>
									<span>{category.name}</span>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<a href="/results" class="flex space-x-1" on:click={() => (sidebarOpen = !sidebarOpen)}>
				<Icon icon="mdi:format-list-numbered" class="h-6 w-6" />
				<span>Výsledky</span>
			</a>
			<a href="/calendar" class="flex space-x-1" on:click={() => (sidebarOpen = !sidebarOpen)}>
				<Icon icon="mdi:calendar-month" class="h-6 w-6" />
				<span>Kalendár</span>
			</a>
			<a href="/ciphers" class="flex space-x-1" on:click={() => (sidebarOpen = !sidebarOpen)}>
				<Icon icon="mdi:puzzle-outline" class="h-6 w-6 -mt-[1px]" />
				<span>Šifrovačka</span>
			</a>
		</div>
	{/if}
</div>
