<script lang="ts">
	import { goto } from '$app/navigation'
	import { darkTheme, settings } from '$lib/data/settings'
	import { userState } from '$lib/state'
	import { toast } from '$lib/utils/toasts'
	import { onMount } from 'svelte'
	import Icon from '$lib/components/Icon.svelte'
	import { getProfile, msalInitialization, signIn } from '$lib/auth'
	import { BrowserAuthError } from '@azure/msal-browser'
	import { getApiHost } from '$lib/data/api'
	import { setAccessToken } from '$lib/state/token'
	import { browser } from '$app/environment'
	import { getUserDetails } from '$lib/api'
	import type { User } from '$lib/types'
	import type { PageData } from './$types'

	export let data: PageData

	let loginPending = false
	let loginStatus = ''
	let statusDetails = ''
	let error = ''
	let errorDetails = ''

	// If backup login is enabled, redirect to it
	$: $settings.backupMicrosoftOAuth.value && browser && goto('/auth/login/backup/')

	// Data processing for secondary login (uses backup login)
	if (data.status !== 'none') {
		;(loginPending = true),
			(loginStatus = 'Overujem údaje...'),
			(statusDetails = 'Spracovávam odpoveď zo serveru')

		const response = data.params
		if (response.status === 'error') {
			console.warn('[BACKUPL] Login error', response)
			clearStatus()
			if (response.error.startsWith('STRERROR')) {
				error = 'Nastala chyba pri prihlasovaní: ' + response.error.split(':', 2)[1]
			} else {
				error = 'Pri prihlasovaní nastala chyba. Skúste to prosím znovu.'
			}
		} else if (response.status === 'success') {
			try {
				;(async () => {
					const userToken = JSON.parse(response.user_token)
					const user = JSON.parse(response.logged_user) as User

					loginStatus = 'Overujem prihlásenie...'
					statusDetails = 'Zisťujem prihláseného používateľa'

					setAccessToken(userToken.token, userToken.expiry)

					const serverStatus = await getUserDetails()
					if (serverStatus.error) {
						clearStatus()
						error = 'Nastala chyba pri overovaní prihlásenia. Skúste to prosím znovu.'
						console.error('[BACKUPL] Error getting user details', serverStatus)
					} else {
						const serverUser = serverStatus.data
						if (!serverUser) {
							clearStatus()
							error = 'Nastala chyba pri overovaní prihlásenia. Skúste to prosím znovu.'
							console.error('[BACKUPL] Received invalid user details', serverStatus)
							return
						}
						if (serverUser.id == user.id) {
							statusDetails = 'Aktualizujem stav prihlásenia'

							await userState.fetchUser()
							clearStatus()
							toast({
								title: 'Prihlásenie úspešné',
								type: 'success',
								duration: 3000,
							})
							goto('/')
						}
					}
				})()
			} catch (e) {
				console.error('[BACKUPL] Failed to parse login data', e)
				clearStatus()
				error = 'Nastala chyba pri spracovaní údajov. Skúste to prosím znovu.'
			}
		} else {
			console.error('[BACKUPL] Unknown login response', response)
			clearStatus()
			error = 'Nastala chyba pri komunikácii so serverom. Skúste to prosím znovu.'
		}
	}

	function backupLogin() {
		loginPending = true
		window.open(
			`${getApiHost()}/auth/begin/microsoft/?next=${window.location.origin}/auth/login/`,
			'_self',
		)
	}

	function clearStatus() {
		;(loginPending = false),
			(loginStatus = ''),
			(statusDetails = ''),
			(error = ''),
			(errorDetails = '')
	}

	async function microsoftLogin() {
		clearStatus()
		;(loginPending = true), (statusDetails = 'Pripravujem prihlásenie')
		await msalInitialization
		const respP = signIn()
		statusDetails = 'Prihlasovacie okno otvorené'
		try {
			const resp = await respP
			;(loginStatus = 'Spracúvam údaje...'), (statusDetails = 'Získavam údaje o používateľovi')
			try {
				const { user, accessToken } = await getProfile()
				statusDetails = 'Údaje boli úspešne získané'
				const serverUrl = `${getApiHost()}/auth/verify/microsoft/`
				const serverReq = fetch(serverUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						access_token: accessToken,
						user,
					}),
				})
				;(loginStatus = 'Overujem údaje...'), (statusDetails = 'Údaje boli odoslané na server')
				const serverResp = await serverReq
				if (serverResp.status == 200) {
					const data = await serverResp.json()
					if (data.status == 'success') {
						statusDetails = 'Údaje boli úspešne overené'
						setAccessToken(data.user_token.token, data.user_token.expiry)
						await userState.fetchUser()
						toast({
							title: 'Prihlásenie úspešné',
							type: 'success',
							duration: 3000,
						})
						goto('/')
					} else {
						clearStatus()
						console.error('Login error', data)
						if (data.error.startsWith('STRERROR')) {
							error = data.error.split(':', 2)[1]
						} else {
							error = 'Pri prihlasovaní nastala chyba.<br>Skúste to prosím znovu.'
							errorDetails = JSON.stringify(data)
						}
					}
				} else {
					clearStatus()
					console.error('Login error', serverResp)
					try {
						const data = await serverResp.json()
						if (data.error.startsWith('STRERROR')) {
							error = data.error.split(':', 2)[1]
						} else {
							error = 'Pri prihlasovaní nastala chyba.<br>Skúste to prosím znovu.'
							errorDetails = JSON.stringify(data)
						}
					} catch (e: any) {
						error = 'Pri prihlasovaní nastala chyba.<br>Skúste to prosím znovu.'
						errorDetails = e.message + '\n' + JSON.stringify(serverResp)
					}
				}
			} catch (e: any) {
				clearStatus()
				console.error('Login error', e)
				error = 'Pri prihlasovaní nastala chyba.<br>Skúste to prosím znovu.'
				errorDetails = e.message + '\n' + e.stack
			}
		} catch (e: any) {
			clearStatus()
			if (e instanceof BrowserAuthError) {
				if (e.errorCode == 'user_cancelled') {
					error = 'Prihlásenie bolo zrušené'
				} else if (e.errorCode == 'popup_window_error') {
					;(loginPending = true),
						(loginStatus = 'Skúšam záložné prihlásenie...'),
						(statusDetails = 'Zlyhalo prihlasovacie okno')
					console.error('Popup login failed, falling back to redirect login')
					backupLogin()
				} else {
					console.error('Login error', e, e.errorCode)
					error = 'Pri prihlasovaní nastala chyba.<br>Skúste to prosím znovu.'
					errorDetails = e.message + ' ' + e.errorCode
				}
			} else {
				console.error('Login error', e)
				error = 'Pri prihlasovaní nastala neznáma chyba.<br>Skúste to prosím znovu.'
				errorDetails = e.message + '\n' + e.stack
			}
		}
	}

	onMount(async () => {
		await userState.loaded
		if ($userState.loggedIn && !loginPending) {
			toast({
				title: 'Už ste prihlásený',
				type: 'info',
				duration: 2000,
			})
			goto('/auth/profile')
		}
	})
</script>

<svelte:head>
	<title>Prihlásenie</title>
</svelte:head>

{#if $settings.requireLogin.value}
	<h3 class="text-red-500 font-bold pb-4">
		Stránka je aktuálne dostupná iba pre prihlásených používateľov.
	</h3>
{/if}

<h1 class="text-2xl font-bold pb-2">Prihlásenie</h1>

{#if error}
	<h3 class="text-red-500 dark:text-red-400 font-semibold text-center pb-4">{@html error}</h3>
{/if}

{#if $settings.debugMode.value && errorDetails}
	<div class="text-xs text-neutral-600 dark:text-neutral-300 pb-2">
		{errorDetails}
	</div>
{/if}

<h4 class="text-neutral-800 dark:text-neutral-100 pb-4">Vyberte si spôsob prihlásenia</h4>
<button
	id="microsoft-login"
	class="flex items-center justify-center
			bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-lg px-4 py-2 mb-6
			hover:bg-neutral-200 dark:hover:bg-neutral-900 relative"
	class:cursor-pointer={!loginPending}
	class:pointer-events-none={loginPending}
	class:disable={loginPending}
	on:click={microsoftLogin}
>
	<img
		src="/assets/logos/microsoft{$darkTheme ? '_dark' : ''}.svg"
		alt="Microsoft logo"
		class="w-52 h-16"
		class:opacity-30={loginPending}
	/>
	{#if loginPending}
		<div class="absolute w-full h-full flex items-center justify-center">
			<Icon icon="mdi:loading" class="w-10 h-10 animate-spin" />
			{#if loginStatus || $settings.debugMode.value}
				<div class="ml-4 flex flex-col">
					<span>{loginStatus}</span>
					{#if $settings.debugMode.value}
						<span class="text-xs text-neutral-600 dark:text-neutral-300">{statusDetails}</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</button>
<a
	id="password-login"
	class="flex items-center justify-center font-semibold w-full
			bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-lg px-4 py-2
			hover:bg-neutral-200 dark:hover:bg-neutral-900 cursor-pointer mb-3"
	class:cursor-pointer={!loginPending}
	class:pointer-events-none={loginPending}
	class:disable={loginPending}
	href="/auth/login/password"
>
	<Icon icon="mdi:key" class="w-8 h-8 mr-4 {loginPending ? 'opacity-30' : ''}" />
	<h4
		class="text-neutral-800 dark:text-neutral-200 text-sm md:text-md"
		class:opacity-30={loginPending}
	>
		Prihlásiť sa pomocou hesla
	</h4>
</a>
<a
	id="admin-login"
	class="flex items-center justify-center w-full
			bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-lg px-4 py-2
			hover:bg-neutral-200 dark:hover:bg-neutral-900 cursor-pointer"
	class:cursor-pointer={!loginPending}
	class:pointer-events-none={loginPending}
	class:disable={loginPending}
	href="/admin/login"
	rel="external"
>
	<Icon
		icon="material-symbols:admin-panel-settings"
		class="w-8 h-8 mr-4 {loginPending ? 'opacity-30' : ''}"
	/>
	<h4
		class="text-neutral-800 dark:text-neutral-200 text-sm md:text-md"
		class:opacity-30={loginPending}
	>
		Prihlásiť sa ako administrátor
	</h4>
</a>
