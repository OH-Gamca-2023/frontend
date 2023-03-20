<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte'
	import { userState } from '$lib/state'
	import { onMount } from 'svelte'
	import { userRoleDict } from '$lib/components/header/UserMenu.svelte'
	import Icon from '@iconify/svelte'
	import { setUserPassword, type ErrorResponse } from '$lib/api'
	import { toast } from '$lib/toasts'

	let title = 'Profil'
	let editPermission = false
	let adminPermission = false

	onMount(async () => {
		await userState.loaded
		if ($userState.loggedIn) {
			title = 'Profil · ' + $userState.user?.username
			editPermission = $userState.user?.type === 'admin' || $userState.user?.type === 'organizer'
			adminPermission = $userState.user?.type === 'admin'

			email = $userState.user?.email ?? ''
			username = $userState.user?.username ?? ''
		} else {
			title = 'Profil · Neprihlásený'
		}
	})

	let email = ''
	let username = ''

	let savingProfile = false

	function saveProfile() {
		/* ... */
	}

	let oldPassword = ''
	let newPassword = ''
	let newPasswordRepeat = ''

	let passwordError = ''
	let changingPassword = false

	async function changePassword() {
		if (newPassword !== newPasswordRepeat) {
			passwordError = 'Heslá sa nezhodujú'
			return
		} else if (newPassword.length < 8) {
			passwordError = 'Heslo musí mať aspoň 8 znakov'
			return
		} else if (newPassword === oldPassword) {
			passwordError = 'Nové heslo musí byť odlišné od starého'
			return
		} else if (oldPassword === '' && $userState.user?.has_password) {
			passwordError = 'Staré heslo musí byť vyplnené'
			return
		}

		const hasNumber = /\d/
		const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
		const hasLetter = /[a-zA-Z]/
		if (!hasNumber.test(newPassword) && !hasSpecial.test(newPassword)) {
			passwordError = 'Heslo musí obsahovať aspoň jedno číslo alebo špeciálny znak'
			return
		} else if (!hasLetter.test(newPassword)) {
			passwordError = 'Heslo musí obsahovať aspoň jedno písmeno'
			return
		}

		passwordError = ''

		changingPassword = true

		const resp = await setUserPassword(
			$userState.user?.has_password ? oldPassword : undefined,
			newPassword,
		)

		if (!resp.error) {
			oldPassword = ''
			newPassword = ''
			newPasswordRepeat = ''

			toast({
				title: 'Heslo bolo úspešne zmenené',
				type: 'success',
				duration: 3000,
			})
			// Ensure that if oldPassword was previously disabled, it is now enabled
			await userState.fetchUser()
		} else {
			oldPassword = ''
			const { status, errorCode, errorMessage } = resp as ErrorResponse
			console.warn(`Error changing password: ${errorCode} (${status}) - ${errorMessage}`)
			switch (status) {
				case 400:
					passwordError = 'Staré heslo je nesprávne'
					break
				case 401:
					passwordError = 'Nie ste prihlásený'
					console.error('User is not logged in, while trying to change password')
					break
				case 403:
					passwordError = 'Nemáte oprávnenie zmeniť heslo'
					break
				case 409:
					passwordError = errorMessage
					break
				default:
					passwordError = 'Nepodarilo sa zmeniť heslo:<br>' + errorMessage
					break
			}
		}

		changingPassword = false
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 pb-2">Profil</h1>

{#await userState.loaded}
	<div class="flex justify-center items-center pt-5">
		<Spinner class="w-10 h-10" />
		<h3 class="text-gray-800 dark:text-gray-200 pl-5">Načítavam...</h3>
	</div>
{:then}
	{#if $userState.loggedIn}
		<div class="pb-4 flex" />
		<div class="flex flex-col text-gray-800 dark:text-gray-200 ">
			<div class="flex flex-row items-center justify-center pb-2">
				<Icon icon={userRoleDict[$userState.user?.type ?? 'unknown'][1]} class="w-16 h-16 mr-2" />
				<div class="flex flex-col">
					<div class="text-sm font-medium">Typ účtu</div>
					<div class="text-lg font-bold">
						{userRoleDict[$userState.user?.type ?? 'unknown'][0]}
					</div>
				</div>
			</div>
			<div class="flex flex-col md:flex-row items-center justify-start pb-2">
				<div class="flex flex-col">
					<span class="text-md font-medium pb-1"> Meno </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
						type="text"
						value={$userState.user?.first_name ?? ''}
						disabled
					/>
				</div>
				<div class="flex flex-col mt-2 md:mt-0 md:ml-4">
					<span class="text-md font-medium pb-1"> Priezvisko </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
						type="text"
						value={$userState.user?.last_name ?? ''}
						disabled
					/>
				</div>
			</div>
			<div class="flex flex-col md:flex-row items-center justify-start pb-2">
				<div class="flex flex-col">
					<span class="text-md font-medium pb-1"> Email </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
						type="text"
						disabled={!adminPermission}
						bind:value={email}
					/>
				</div>
				<div class="flex flex-col mt-2 md:mt-0 md:ml-4">
					<span class="text-md font-medium pb-1"> Používateľské meno </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
						type="text"
						disabled={!editPermission}
						bind:value={username}
					/>
				</div>
			</div>
			<div class="flex flex-col md:flex-row items-center justify-start pb-2">
				<div class="flex flex-col">
					<span class="text-md font-medium pb-1"> Microsoft účet </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed w-auto"
						type="text"
						value={$userState.user?.microsoft_user ?? ''}
						disabled
					/>
				</div>
				<div class="flex flex-col mt-2 md:mt-0 md:ml-4">
					<span class="text-md font-medium pb-1"> Trieda </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
						type="text"
						value={($userState.user?.clazz?.name ?? '') +
							(' (' + $userState.user?.clazz?.grade?.name + ')' ?? '')}
						disabled
					/>
				</div>
			</div>
			{#if !editPermission}
				<div class="text-red-500 text-md font-bold">
					Pre váš typ účtu nie sú povolené úpravy profilu.
				</div>
			{:else if !adminPermission}
				<div class="text-red-500 text-md font-bold">
					Pre váš typ účtu sú povolené iba limitované úpravy profilu.
				</div>
			{/if}
			{#if editPermission}
				<div class="flex flex-row items-center justify-center pb-2">
					<button
						class="flex flex-row items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4"
						on:click={saveProfile}
					>
						<Icon icon="material-symbols:save" class="w-4 h-4 mr-2" />
						Uložiť zmeny
					</button>
				</div>
			{/if}
			<div class="flex flex-col items-center justify-center pt-5 pb-2">
				<h2 class="text-lg font-bold text-gray-800 dark:text-gray-200 pb-2">Zmena hesla</h2>
				<div class="flex flex-col md:flex-row items-start justify-center pb-2">
					<div class="flex flex-col">
						<span class="text-md font-medium pb-1"> Staré heslo </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
							type="password"
							disabled={!editPermission || !$userState.user?.has_password}
							bind:value={oldPassword}
						/>
						<span class="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
							{#if $userState.user?.has_password}
								Zadajte staré heslo, ak chcete zmeniť heslo.
							{:else}
								Ešte nemáte nastavené žiadne heslo.
								{#if editPermission}
									<br />Bez nastaveného hesla sa neviete dostať<br />do organizátorského rozhrania.
								{/if}
							{/if}
						</span>
					</div>
					<div class="flex flex-col mt-2 md:mt-0 md:ml-4 justify-start">
						<span class="text-md font-medium pb-1"> Nové heslo </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
							type="password"
							disabled={!editPermission}
							bind:value={newPassword}
						/>
						<div class="pb-2" />
						<span class="text-md font-medium pb-1"> Nové heslo znova </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
							type="password"
							disabled={!editPermission}
							bind:value={newPasswordRepeat}
						/>
					</div>
				</div>
				{#if !editPermission}
					<div class="text-red-500 text-md font-bold">
						Pre váš typ účtu nie je povolená zmena hesla.
					</div>
				{:else}
					<div class="text-red-500 text-md font-bold">
						{passwordError}
					</div>
					<div class="flex flex-row items-center justify-center pb-2">
						<button
							class="flex flex-row items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
							on:click={changePassword}
						>
							<Icon icon="material-symbols:vpn-key" class="w-6 h-6 mr-2" />
							Zmeniť heslo
						</button>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<h3 class="text-gray-800 dark:text-gray-200 pb-4">Neprihlásený</h3>
		<a
			class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
			href="/auth/login">Prihlásiť</a
		>
	{/if}
{/await}
