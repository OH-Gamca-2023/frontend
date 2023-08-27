<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { userState } from '$lib/state'
	import consoleLog, { type ConsoleLogEntry } from '$lib/utils/consoleLog'

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
</script>

<div class="flex flex-col min-w-[50rem] max-w-[50rem]">
	<span class="text-xl font-bold">Debug</span>
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
