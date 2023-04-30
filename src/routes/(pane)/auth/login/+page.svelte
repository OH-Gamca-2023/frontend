<script lang="ts">
	import { goto } from '$app/navigation'
	import { getUserDetails } from '$lib/api'
	import { darkTheme } from '$lib/prefs'
	import { userState } from '$lib/state'
	import { toast } from '$lib/toasts'
	import Icon from '@iconify/svelte'
	import type { PageData } from './$types'
	import { getApiHost } from '$lib/api/data'
	import { setAccessToken } from '$lib/state/token'
	import { loginRequired } from '$lib/data/settings'
	import { onMount } from 'svelte'

	export let data: PageData

	let loginPending = data.status !== 'none'
	let loginStatus = ''
	let error = ''

	if (loginPending) {
		loginStatus = 'Overujem údaje...'

		const response = data.params
		if (response.status === 'error') {
			console.warn('Login error', response)
			if (response.error.startsWith('STRERROR')) {
				error = 'Nastala chyba pri prihlasovaní: ' + response.error.split(':', 2)[1]
			} else {
				error = 'Pri prihlasovaní nastala chyba. Skúste to prosím znovu.'
			}
			loginPending = false
		} else if (response.status === 'success') {
			try {
				parseData(response)
			} catch (e) {
				console.error('Failed to parse login data', e)
				error = 'Nastala chyba pri spracovaní údajov. Skúste to prosím znovu.'
				loginPending = false
			}
		} else {
			console.error('Unknown login response', response)
			error = 'Nastala chyba pri komunikácii so serverom. Skúste to prosím znovu.'
			loginPending = false
		}
	}

	async function parseData(response: any) {
		const rawUserToken = JSON.parse(response.user_token)[0]
		const userToken = {
			token: rawUserToken.pk,
			...rawUserToken.fields,
		}
		const rawUser = JSON.parse(response.logged_user)[0]
		const user = {
			id: rawUser.pk,
			...rawUser.fields,
		}

		loginStatus = 'Overujem prihlásenie...'

		if (user.id != userToken.user) {
			loginPending = false
			error = 'Nastala chyba pri overovaní prihlásenia. Skúste to prosím znovu.'
			return
		}

		setAccessToken(userToken.token)

		const serverStatus = await getUserDetails()
		if (serverStatus.error) {
			loginPending = false
			error = 'Nastala chyba pri overovaní prihlásenia. Skúste to prosím znovu.'
		} else {
			const serverUser = serverStatus.data
			if (!serverUser) {
				loginPending = false
				error = 'Nastala chyba pri overovaní prihlásenia. Skúste to prosím znovu.'
				return
			}
			if (serverUser.id == user.id) {
				if (userToken.user == user.id) {
					setAccessToken(userToken.token)
				}
				await userState.fetchUser()
				loginPending = false
				loginStatus = ''
				toast({
					title: 'Prihlásenie úspešné',
					type: 'success',
					duration: 3000,
				})
				goto('/')
			}
		}
	}

	function microsoftLogin() {
		loginPending = true
		window.open(getApiHost() + '/auth/login', '_self')
	}

	onMount(async () => {
		await userState.loaded
		if ($userState.loggedIn && !loginPending) {
			toast({
				title: 'Už ste prihlásený',
				type: 'info',
				duration: 2000,
			})
			goto('/')
		}
	})
</script>

<svelte:head>
	<title>Prihlásenie</title>
</svelte:head>

{#if loginRequired}
	<h3 class="text-red-500 font-bold pb-4">
		Stránka je aktuálne dostupná iba pre prihlásených používateľov.
	</h3>
{/if}

<h1 class="text-2xl font-bold pb-2">Prihlásenie</h1>

<h3 class="text-red-500 dark:text-red-400 pb-4">{error}</h3>

<h4 class="text-gray-800 dark:text-gray-100 pb-4">Vyberte si spôsob prihlásenia</h4>
<div
	id="microsoft-login"
	class="flex flex-row items-center justify-center
                    bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 mb-6
                    hover:bg-gray-200 dark:hover:bg-gray-900 relative"
	class:cursor-pointer={!loginPending}
	class:pointer-events-none={loginPending}
	class:disable={loginPending}
	on:click={microsoftLogin}
	on:keypress={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			microsoftLogin()
		}
	}}
>
	<img
		src="/assets/microsoft_logo{$darkTheme ? '_dark' : ''}.svg"
		alt="Microsoft logo"
		class="w-52 h-16"
		class:opacity-30={loginPending}
	/>
	{#if loginPending}
		<div class="absolute w-full h-full flex flex-row items-center justify-center">
			<Icon icon="mdi:loading" class="w-10 h-10 animate-spin" />
			{#if loginStatus}
				<span class="ml-4">{loginStatus}</span>
			{/if}
		</div>
	{/if}
</div>
<div
	id="admin-login"
	class="flex flex-row items-center justify-center
                    bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2
                    hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer"
	class:cursor-pointer={!loginPending}
	class:pointer-events-none={loginPending}
	class:disable={loginPending}
	on:click={() => {
		window.location.href = '/admin/login'
	}}
	on:keypress={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			window.location.href = '/admin/login'
		}
	}}
>
	<Icon
		icon="material-symbols:admin-panel-settings"
		class="w-8 h-8 mr-4 {loginPending ? 'opacity-30' : ''}"
	/>
	<h4 class="text-gray-800 dark:text-gray-200 text-sm md:text-md" class:opacity-30={loginPending}>
		Prihlásiť sa ako administrátor
	</h4>
</div>
