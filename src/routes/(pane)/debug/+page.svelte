<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { userState } from '$lib/state'
	import consoleLog, { type ConsoleLogEntry } from '$lib/utils/consoleLog'
	import { onMount } from 'svelte'

	let stateCollapsed = true
	let consoleCollapsed = true

	let consoleLogStyleMap = {
		debug: {
			class: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
			icon: 'mdi:bug',
		},
		info: {
			class: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
			icon: 'mdi:information',
		},
		log: {
			class: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
			icon: 'mdi:information',
		},
		warn: {
			class: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200',
			icon: 'mdi:alert',
		},
		error: {
			class: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200',
			icon: 'mdi:alert',
		},
	} as { [key in ConsoleLogEntry['type']]: { class: string; icon: string } }

	let wHeight = -1,
		wWidth = -1
	onMount(() => {
		;(wHeight = window.innerHeight), (wWidth = window.innerWidth)
	})
</script>

<svelte:window
	on:resize={() => {
		;(wHeight = window.innerHeight), (wWidth = window.innerWidth)
	}}
/>

<div class="flex flex-col min-w-full lmd:min-w-[50rem] max-w-[50rem]">
	<span class="text-xl font-bold">Debug</span>

	<div class="flex gap-2 p-4">
		<div class="px-2 py-1 rounded bg-pink-500 text-black">{wWidth}x{wHeight}</div>
		<div class="hidden sm:block px-2 py-1 rounded bg-red-500 text-black">sm</div>
		<div class="hidden md:block px-2 py-1 rounded bg-orange-500 text-black">md</div>
		<div class="hidden lmd:block px-2 py-1 rounded bg-amber-500 text-black">lmd</div>
		<div class="hidden lg:block px-2 py-1 rounded bg-yellow-500 text-black">lg</div>
		<div class="hidden xl:block px-2 py-1 rounded bg-lime-500 text-black">xl</div>
		<div class="hidden 2xl:block px-2 py-1 rounded bg-green-500 text-black">2xl</div>
	</div>

	<div class="flex justify-between">
		<span class="text-lg">State</span>
		<button
			class="text-lg font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
			on:click={() => {
				stateCollapsed = !stateCollapsed
			}}
		>
			{stateCollapsed ? 'Show' : 'Hide'}
		</button>
	</div>
	<!-- It's important that the nex line is not expanded in code -->
	<pre class="text-sm" class:hidden={stateCollapsed}>{JSON.stringify($userState, null, 2)}</pre>

	<div class="flex justify-between">
		<span class="text-lg">Console log</span>
		<button
			class="text-lg font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
			on:click={() => {
				consoleCollapsed = !consoleCollapsed
			}}
		>
			{consoleCollapsed ? 'Show' : 'Hide'}
		</button>
	</div>
	<div class="flex flex-col max-h-[50rem] overflow-y-scroll" class:hidden={consoleCollapsed}>
		{#each $consoleLog as log}
			<div class="flex {consoleLogStyleMap[log.type].class} items-center rounded-md p-1 my-1">
				<Icon class="w-4 h-4" icon={consoleLogStyleMap[log.type].icon} />
				<span class="ml-2">{log.message}</span>
			</div>
		{/each}
	</div>
</div>
