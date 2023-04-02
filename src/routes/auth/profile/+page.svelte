<script lang="ts">
	import Spinner from '$lib/components/Spinner.svelte'
	import { userState } from '$lib/state'
	import { onMount } from 'svelte'
	import { userRoleDict } from '$lib/components/header/UserMenu.svelte'
	import Icon from '@iconify/svelte'
	import { getUserPermissions, setUserDetails, setUserPassword, type ErrorResponse } from '$lib/api'
	import { toast } from '$lib/toasts'
	import type { User } from '$lib/types'

	let title = 'Profil'
	let permissionsLoaded = false
	let permissionLoadError = false
	let editPermissions = {
		first_name: false,
		last_name: false,
		email: false,
		username: false,
		password: false,
	}
	let isSuperuser = false

	onMount(async () => {
		await userState.loaded
		if ($userState.loggedIn) {
			title = 'Profil · ' + $userState.user?.username

			firstName = $userState.user?.first_name ?? ''
			lastName = $userState.user?.last_name ?? ''
			email = $userState.user?.email ?? ''
			username = $userState.user?.username ?? ''

			const permRequest = await getUserPermissions()
			if (!permRequest.error) {
				for (const perm of permRequest.data?.profile_edit ?? []) {
					if (perm in editPermissions) {
						editPermissions[perm as keyof typeof editPermissions] = true
					}
				}
				isSuperuser = permRequest.data?.superuser ?? false
				permissionsLoaded = true
			} else {
				permissionLoadError = true
			}
		} else {
			title = 'Profil · Neprihlásený'
		}
	})

	let firstName = ''
	let lastName = ''
	let email = ''
	let username = ''

	let savingProfile = false

	function errorToast(message: string, desc?: string) {
		toast({
			title: message,
			message: desc,
			type: 'error',
			duration: 3000,
		})
	}

	async function saveProfile() {
		let changes = {} as Partial<User>
		if (firstName === '' || lastName === '' || email === '' || username === '') {
			errorToast('Všetky polia musia byť vyplnené')
			return
		}
		if (email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) === null) {
			errorToast('Emailová adresa nie je platná')
			return
		}

		if (firstName !== $userState.user?.first_name) {
			if (!editPermissions.first_name) {
				errorToast('Nemáte oprávnenie zmeniť meno')
				return
			} else {
				changes.first_name = firstName
			}
		}

		if (lastName !== $userState.user?.last_name) {
			if (!editPermissions.last_name) {
				errorToast('Nemáte oprávnenie zmeniť priezvisko')
				return
			} else {
				changes.last_name = lastName
			}
		}

		if (email !== $userState.user?.email) {
			if (!editPermissions.email) {
				errorToast('Nemáte oprávnenie zmeniť email')
				return
			} else {
				changes.email = email
			}
		}

		if (username !== $userState.user?.username) {
			if (!editPermissions.username) {
				errorToast('Nemáte oprávnenie zmeniť užívateľské meno')
				return
			} else {
				changes.username = username
			}
		}

		savingProfile = true

		const resp = await setUserDetails(changes)
		if (resp.error) {
			errorToast('Nastala chyba pri ukladaní profilu')
		} else {
			toast({
				title: 'Profil bol úspešne uložený',
				type: 'success',
				duration: 5000,
			})
		}
		savingProfile = false
	}

	let oldPassword = ''
	let newPassword = ''
	let newPasswordRepeat = ''

	let passwordError = ''
	let changingPassword = false

	async function changePassword() {
		if (newPassword !== newPasswordRepeat) {
			errorToast('Heslá sa nezhodujú')
			return
		} else if (newPassword.length < 8) {
			errorToast('Heslo musí mať aspoň 8 znakov')
			return
		} else if (newPassword === oldPassword) {
			errorToast('Nové heslo musí byť odlišné od starého')
			return
		} else if (oldPassword === '' && $userState.user?.has_password) {
			errorToast('Staré heslo musí byť vyplnené')
			return
		}

		const hasNumber = /\d/
		const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
		const hasLetter = /[a-zA-Z]/
		if (!hasNumber.test(newPassword) && !hasSpecial.test(newPassword)) {
			errorToast('Heslo musí obsahovať aspoň jedno číslo alebo špeciálny znak')
			return
		} else if (!hasLetter.test(newPassword)) {
			errorToast('Heslo musí obsahovať aspoň jedno písmeno')
			return
		}

		changingPassword = true

		const resp = await setUserPassword(
			$userState.user?.has_password ? oldPassword : undefined,
			newPassword,
		)

		if (!resp.error) {
			oldPassword = ''
			newPassword = ''
			newPasswordRepeat = ''

			// Ensure that if oldPassword was previously disabled, it is now enabled
			await userState.fetchUser()

			toast({
				title: 'Heslo bolo úspešne zmenené',
				type: 'success',
				duration: 3000,
			})
		} else {
			oldPassword = ''
			const { status, errorCode, errorMessage } = resp as ErrorResponse
			console.warn(`Error changing password: ${errorCode} (${status}) - ${errorMessage}`)
			switch (status) {
				case 400:
					errorToast('Staré heslo je nesprávne')
					break
				case 401:
					errorToast('Nie ste prihlásený')
					console.error('User is not logged in, while trying to change password')
					break
				case 403:
					errorToast('Nemáte oprávnenie zmeniť heslo')
					break
				case 409:
					errorToast(errorMessage)
					break
				default:
					errorToast('Nepodarilo sa zmeniť heslo:', errorMessage)
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
				<Icon
					icon={userRoleDict[$userState.user?.type ?? 'unknown'][1]}
					class="w-16 h-16 mr-2 {isSuperuser ? 'text-yellow-500' : ''}"
				/>
				<div class="flex flex-col">
					<div class="text-sm font-medium">Typ účtu</div>
					<div class="text-lg font-bold">
						{#if isSuperuser}
							<span class="text-amber-500">Superadmin</span>
						{:else}
							{userRoleDict[$userState.user?.type ?? 'unknown'][0]}
						{/if}
					</div>
				</div>
			</div>
			<div class="flex flex-col md:flex-row items-center justify-start pb-2">
				<div class="flex flex-col">
					<span class="text-md font-medium pb-1"> Meno </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
						type="text"
						disabled={!editPermissions.first_name}
						bind:value={firstName}
					/>
				</div>
				<div class="flex flex-col mt-2 md:mt-0 md:ml-4">
					<span class="text-md font-medium pb-1"> Priezvisko </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
						type="text"
						disabled={!editPermissions.last_name}
						bind:value={lastName}
					/>
				</div>
			</div>
			<div class="flex flex-col md:flex-row items-center justify-start pb-2">
				<div class="flex flex-col">
					<span class="text-md font-medium pb-1"> Email </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
						type="text"
						disabled={!editPermissions.email}
						bind:value={email}
					/>
				</div>
				<div class="flex flex-col mt-2 md:mt-0 md:ml-4">
					<span class="text-md font-medium pb-1"> Používateľské meno </span>
					<input
						class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
						type="text"
						disabled={!editPermissions.username}
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
			<div class="flex flex-col items-center justify-center py-2">
				{#if permissionsLoaded}
					{#if !Object.values(editPermissions).some((x) => x)}
						<div class="text-red-500 text-md font-bold">
							Pre váš typ účtu nie sú povolené úpravy profilu.
						</div>
					{:else if !Object.values(editPermissions).every((x) => x)}
						<div class="text-amber-500 text-md font-bold">
							Pre váš typ účtu sú povolené iba limitované úpravy profilu.
						</div>
					{/if}
					{#if Object.values(editPermissions).some((x) => x)}
						<div class="flex flex-row items-center justify-center">
							<button
								class="flex flex-row items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4
								disabled:bg-green-400 disabled:hover:bg-green-400 dark:disabled:bg-green-700 dark:hover:bg-green-700"
								on:click={saveProfile}
								disabled={savingProfile}
							>
								{#if savingProfile}
									<Spinner class="w-4 h-4 mr-2" />
									Ukladám...
								{:else}
									<Icon icon="material-symbols:save" class="w-4 h-4 mr-2" />
									Uložiť zmeny
								{/if}
							</button>
						</div>
					{/if}
				{:else if permissionLoadError}
					<div class="text-red-500 text-md font-bold">Chyba pri načítavaní oprávnení.</div>
				{:else}
					<div class="flex flex-row items-center justify-center pb-2 pt-2">
						<Spinner class="w-6 h-6" />
						<span class="text-sm font-bold ml-2">Načítavam...</span>
					</div>
				{/if}
			</div>
			<div class="flex flex-col items-center justify-center pt-5 pb-2">
				<h2 class="text-lg font-bold text-gray-800 dark:text-gray-200 pb-2">Zmena hesla</h2>
				<div class="flex flex-col md:flex-row items-start justify-center pb-2">
					<div class="flex flex-col">
						<span class="text-md font-medium pb-1"> Staré heslo </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
							type="password"
							disabled={!editPermissions.password || !$userState.user?.has_password}
							bind:value={oldPassword}
						/>
						<span class="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
							{#if $userState.user?.has_password}
								Zadajte staré heslo, ak chcete zmeniť heslo.
							{:else}
								Ešte nemáte nastavené žiadne heslo.
								{#if editPermissions.password}
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
							disabled={!editPermissions.password}
							bind:value={newPassword}
						/>
						<div class="pb-2" />
						<span class="text-md font-medium pb-1"> Nové heslo znova </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-gray-200 dark:bg-gray-700 disabled:bg-gray-400 disabled:dark:bg-gray-500 disabled:cursor-not-allowed"
							type="password"
							disabled={!editPermissions.password}
							bind:value={newPasswordRepeat}
						/>
					</div>
				</div>
				{#if permissionsLoaded}
					{#if !editPermissions.password}
						<div class="text-red-500 text-md font-bold">
							Pre váš typ účtu nie je povolená zmena hesla.
						</div>
					{:else}
						<div class="flex flex-row items-center justify-center pb-2">
							<button
								class="flex flex-row items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4
								disabled:bg-blue-400 disabled:hover:bg-blue-400 dark:disabled:bg-blue-700 dark:hover:bg-blue-700"
								on:click={changePassword}
								disabled={changingPassword}
							>
								{#if changingPassword}
									<Spinner class="w-4 h-4 mr-2" />
									Ukladám...
								{:else}
									<Icon icon="material-symbols:vpn-key" class="w-6 h-6 mr-2" />
									Zmeniť heslo
								{/if}
							</button>
						</div>
					{/if}
				{:else if permissionLoadError}
					<div class="text-red-500 text-md font-bold">Chyba pri načítavaní oprávnení.</div>
				{:else}
					<div class="flex flex-row items-center justify-center pb-2 pt-2">
						<Spinner class="w-6 h-6" />
						<span class="text-sm font-bold ml-2">Načítavam...</span>
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
