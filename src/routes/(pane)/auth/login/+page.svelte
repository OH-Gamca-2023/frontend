<script lang="ts">
	import { goto } from '$app/navigation'
	import { getUserDetails } from '$lib/api'
	import { darkTheme, prefs } from '$lib/data/prefs'
	import { userState } from '$lib/state'
	import { toast } from '$lib/utils/toasts'
	import type { PageData } from './$types'
	import { getApiHost } from '$lib/data/api'
	import { setAccessToken } from '$lib/state/token'
	import { loginRequired } from '$lib/data/settings'
	import { onMount } from 'svelte'
	import Icon from '$lib/components/Icon.svelte'
	import type { User } from '$lib/types'

	export let data: PageData

	let loginPending = data.status !== 'none'
	let loginStatus = ''
	let statusDetails = ''
	let error = ''

	if (loginPending) {
		loginStatus = 'Overujem údaje...'
		statusDetails = 'Spracovávam odpoveď zo serveru'

		const response = data.params
		if (response.status === 'error') {
			console.warn('Login error', response)
			if (response.error.startsWith('STRERROR')) {
				error = 'Nastala chyba pri prihlasovaní: ' + response.error.split(':', 2)[1]
			} else {
				error = 'Pri prihlasovaní nastala chyba. Skúste to prosím znovu.'
			}
			;(loginPending = false), (loginStatus = ''), (statusDetails = '')
		} else if (response.status === 'success') {
			try {
				parseData(response)
			} catch (e) {
				console.error('Failed to parse login data', e)
				error = 'Nastala chyba pri spracovaní údajov. Skúste to prosím znovu.'
				;(loginPending = false), (loginStatus = ''), (statusDetails = '')
			}
		} else {
			console.error('Unknown login response', response)
			error = 'Nastala chyba pri komunikácii so serverom. Skúste to prosím znovu.'
			;(loginPending = false), (loginStatus = ''), (statusDetails = '')
		}
	}

	async function parseData(response: any) {
		const rawUserToken = JSON.parse(response.user_token)
		const userToken = {
			token: rawUserToken.token,
			expires: new Date(rawUserToken.expiry),
		}
		const user = JSON.parse(response.logged_user) as User

		loginStatus = 'Overujem prihlásenie...'
		statusDetails = 'Zisťujem prihláseného používateľa'

		setAccessToken(userToken.token)

		const serverStatus = await getUserDetails()
		if (serverStatus.error) {
			;(loginPending = false), (loginStatus = ''), (statusDetails = '')
			error = 'Nastala chyba pri overovaní prihlásenia. Skúste to prosím znovu.'
			console.error('Error getting user details', serverStatus)
		} else {
			const serverUser = serverStatus.data
			if (!serverUser) {
				;(loginPending = false), (loginStatus = ''), (statusDetails = '')
				error = 'Nastala chyba pri overovaní prihlásenia. Skúste to prosím znovu.'
				console.error('Received invalid user details', serverStatus)
				return
			}
			if (serverUser.id == user.id) {
				setAccessToken(userToken.token)
				statusDetails = 'Aktualizujem stav prihlásenia'

				await userState.fetchUser()
				;(loginPending = false), (loginStatus = ''), (statusDetails = '')
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
		let host = window.location.host
		if (!(host.startsWith('http://') || host.startsWith('https://'))) host = 'http://' + host
		window.open(`${getApiHost()}/auth/begin/microsoft/?next=${host}/auth/login/`, '_self')
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

{#if error}
	<h3 class="text-red-500 dark:text-red-400 pb-4">{error}</h3>
{/if}

<h4 class="text-gray-800 dark:text-gray-100 pb-4">Vyberte si spôsob prihlásenia</h4>
<button
	id="microsoft-login"
	class="flex flex-row items-center justify-center
                    bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 mb-6
                    hover:bg-gray-200 dark:hover:bg-gray-900 relative"
	class:cursor-pointer={!loginPending}
	class:pointer-events-none={loginPending}
	class:disable={loginPending}
	on:click={microsoftLogin}
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
				<div class="ml-4 flex flex-col">
					<span>{loginStatus}</span>
					{#if $prefs.debugMode}
						<span class="text-xs text-gray-600 dark:text-gray-300">{statusDetails}</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</button>
<a
	id="password-login"
	class="flex flex-row items-center justify-center font-semibold w-full
                    bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2
                    hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer mb-3"
	class:cursor-pointer={!loginPending}
	class:pointer-events-none={loginPending}
	class:disable={loginPending}
	href="password"
>
	<Icon icon="mdi:key" class="w-8 h-8 mr-4 {loginPending ? 'opacity-30' : ''}" />
	<h4 class="text-gray-800 dark:text-gray-200 text-sm md:text-md" class:opacity-30={loginPending}>
		Prihlásiť sa pomocou hesla
	</h4>
</a>
<a
	id="admin-login"
	class="flex flex-row items-center justify-center w-full
                    bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2
                    hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer"
	class:cursor-pointer={!loginPending}
	class:pointer-events-none={loginPending}
	class:disable={loginPending}
	href="/admin/login"
>
	<Icon
		icon="material-symbols:admin-panel-settings"
		class="w-8 h-8 mr-4 {loginPending ? 'opacity-30' : ''}"
	/>
	<h4 class="text-gray-800 dark:text-gray-200 text-sm md:text-md" class:opacity-30={loginPending}>
		Prihlásiť sa ako administrátor
	</h4>
</a>
