<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { login, type ApiResponse, type ErrorResponse, getUserDetails } from '$lib/api'
	import { setAccessToken } from '$lib/state/token'
	import { userState } from '$lib/state'
	import { toast } from '$lib/utils/toasts'
	import { goto } from '$app/navigation'

	let error = ''
	let loginPending = false
	let loginStatus = ''

	let loginFieldValue = ''
	let passwordFieldValue = ''

	async function handleResponse(response: ApiResponse<{ expiry: string; token: string }>) {
		if (response.error) {
			error = (response as ErrorResponse).data.detail ?? 'Nastala neznáma chyba'
		} else if (!response.data) {
			error = 'Server odoslal neplatnú odpoveď'
		} else {
			loginStatus = 'Overujem prihlásenie...'
			setAccessToken(response.data.token)

			const serverStatus = await getUserDetails()
			if (serverStatus.error) {
				error = 'Nastala chyba pri overovaní prihlásenia. Skúste to prosím znovu.'
				console.error('Error getting user details', serverStatus)
			} else {
				const serverUser = serverStatus.data
				if (!serverUser) {
					error = 'Nastala chyba pri overovaní prihlásenia. Skúste to prosím znovu.'
					console.error('Received invalid user details', serverStatus)
					return
				}

				await userState.fetchUser()
				toast({
					title: 'Prihlásenie úspešné',
					type: 'success',
					duration: 3000,
				})
				goto('/')
			}
		}
		;(loginPending = false), (loginStatus = '')
	}
</script>

<h1 class="text-2xl font-bold pb-2">Prihlásenie</h1>

{#if error}
	<h3 class="text-red-500 dark:text-red-400 pb-4">{error}</h3>
{/if}

<form
	class="flex flex-col gap-2 mt-2 pb-4 mb-4 border-b border-gray-200 dark:border-gray-600"
	on:submit|preventDefault={async () => {
		loginPending = true
		error = ''
		loginStatus = 'Overujem údaje...'

		const response = await login(loginFieldValue, passwordFieldValue)

		handleResponse(response)
	}}
>
	<label class="flex flex-col gap-1">
		<span class="text-gray-800 dark:text-gray-100">Prihlasovacie meno alebo e-mail</span>
		<input
			bind:value={loginFieldValue}
			type="text"
			class="rounded-lg font-bold px-4 py-2 bg-gray-200 dark:bg-slate-800 disabled:bg-gray-400 disabled:dark:bg-gray-500
				disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			disabled={loginPending}
			required
		/>
	</label>
	<label class="flex flex-col gap-1">
		<span class="text-gray-800 dark:text-gray-100">Heslo</span>
		<input
			bind:value={passwordFieldValue}
			type="password"
			class="rounded-lg font-bold px-4 py-2 bg-gray-200 dark:bg-slate-800 disabled:bg-gray-400 disabled:dark:bg-gray-500
				disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			disabled={loginPending}
			required
		/>
	</label>
	<button
		class="flex gap-2 items-center justify-center font-bold h-10
				bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 mt-3
				hover:bg-gray-200 dark:hover:bg-gray-900 relative"
		class:cursor-pointer={!loginPending}
		class:pointer-events-none={loginPending}
		disabled={loginPending}
		type="submit"
	>
		{#if loginPending}
			<Icon icon="mdi:loading" class="w-8 h-8 animate-spin" />
			{#if loginStatus}
				<div class="ml-4 flex flex-col">
					<span>{loginStatus}</span>
				</div>
			{/if}
		{:else}
			<Icon icon="mdi:login" class="w-6 h-6" />
			<span>Prihlásiť sa</span>
		{/if}
	</button>
</form>

<a
	id="back"
	class="flex items-center justify-center
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
