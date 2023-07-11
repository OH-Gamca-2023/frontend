<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'

	let error = ''
	let loginPending = false
</script>

<h1 class="text-2xl font-bold pb-2">Prihlásenie</h1>

{#if error}
	<h3 class="text-red-500 dark:text-red-400 pb-4">{error}</h3>
{/if}

<h4 class="text-xl text-gray-800 dark:text-gray-100 pb-4">Prihlásenie heslom</h4>
<h3 class="text-red-500 dark:text-red-400 pb-4">Zatiaľ nedostupné</h3>
<a
	id="back"
	class="flex flex-row items-center justify-center
                    bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2
                    hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer"
	class:cursor-pointer={!loginPending}
	class:pointer-events-none={loginPending}
	class:disable={loginPending}
	href="/auth/login"
>
	<Icon icon="mdi:arrow-left" class="w-6 h-6" />
	<span class="ml-2">Prihlásiť sa iným spôsobom</span>
</a>
