<script lang="ts">
	import { userState } from '$lib/state'
	import { onMount } from 'svelte'
	import { userRoleDict } from '$lib/components/header/UserMenu.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import { setUserDetails, setUserPassword, type ErrorResponse } from '$lib/api'
	import { toast } from '$lib/utils/toasts'
	import type { ProfileEditPermissions, User } from '$lib/types'
	import { goto } from '$app/navigation'

	let title = 'Profil'
	$: editPermissions =
		$userState.user?.permissions.profile_edit ??
		({
			username: false,
			first_name: false,
			last_name: false,
			email: false,
			phone_number: false,
			password: false,
		} as ProfileEditPermissions)

	onMount(async () => {
		await userState.loaded
		if ($userState.loggedIn) {
			title = 'Profil · ' + $userState.user?.username

			firstName = $userState.user?.first_name ?? ''
			lastName = $userState.user?.last_name ?? ''
			email = $userState.user?.email ?? ''
			username = $userState.user?.username ?? ''
			phone = $userState.user?.phone_number ?? ''
			discord_id = $userState.user?.discord_id ?? ''
		} else {
			title = 'Profil · Neprihlásený'
		}
	})

	let firstName = ''
	let lastName = ''
	let email = ''
	let username = ''
	let phone = ''
	let discord_id = ''

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
		if (email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g) === null) {
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

		if (phone !== $userState.user?.phone_number) {
			if (!editPermissions.phone_number) {
				errorToast('Nemáte oprávnenie zmeniť telefónne číslo')
				return
			} else {
				changes.phone_number = phone
			}
		}

		if (discord_id !== $userState.user?.discord_id) {
			if (!editPermissions.discord_id) {
				errorToast('Nemáte oprávnenie zmeniť ID Discord účtu')
				return
			} else {
				console.log('discord_id', discord_id)
				changes.discord_id = discord_id
			}
		}
		console.log(discord_id, $userState.user?.discord_id, changes)

		savingProfile = true

		const resp = await setUserDetails(changes)
		if (resp.error) {
			errorToast('Nastala chyba pri ukladaní profilu', (resp as ErrorResponse).data!.error)
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
			const { status, data } = resp as ErrorResponse
			console.warn(`Error changing password: (${status}) - ${data}`)
			switch (status) {
				case 400:
					errorToast(data!.error)
					break
				case 401:
					errorToast('Nie ste prihlásený')
					console.error('User is not logged in, while trying to change password')
					break
				case 403:
					errorToast('Nemáte oprávnenie zmeniť heslo')
					break
				case 409:
					errorToast(data!.error)
					break
				default:
					errorToast('Nepodarilo sa zmeniť heslo:', data!.error)
					break
			}
		}

		changingPassword = false
	}

	let loggingOutAll = false
	async function logoutAll() {
		loggingOutAll = true
		await userState.loaded
		if ($userState.loggedIn) {
			const resp = await userState.logoutAllDevices()
			if (!resp) {
				errorToast('Nepodarilo sa odhlásiť zo všetkých zariadení')
				await userState.fetchUser()
			} else {
				toast({
					title: 'Boli ste odhlásený zo všetkých zariadení',
					type: 'success',
					duration: 3000,
				})
				goto('/auth/login')
			}
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200 pb-2">Profil</h1>

{#await userState.loaded}
	<div class="flex justify-center items-center pt-5">
		<Icon icon="mdi:loading" class="w-10 h-10 animate-spin" />
		<h3 class="text-neutral-800 dark:text-neutral-200 pl-5">Načítavam...</h3>
	</div>
{:then}
	{#if $userState.loggedIn}
		<div class="pb-4 flex" />
		<div
			class="flex flex-col text-neutral-800 dark:text-neutral-200 divide-y divide-neutral-300 dark:divide-neutral-600"
		>
			<div class="flex items-center justify-center pb-2">
				<Icon icon={userRoleDict[$userState.user?.type ?? 'unknown'][1]} class="w-16 h-16 mr-2" />
				<div class="flex flex-col">
					<div class="text-sm font-medium">Typ účtu</div>
					<div class="text-lg font-bold">
						{userRoleDict[$userState.user?.type ?? 'unknown'][0]}
					</div>
				</div>
			</div>
			<form style="border-top: none;" class="pb-4 [&>*]:items-center [&>*]:justify-center">
				<div class="flex flex-col md:flex-row pb-2">
					<div class="flex flex-col">
						<span class="text-md font-medium pb-1"> Meno </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
							type="text"
							autocomplete="given-name"
							disabled={!editPermissions.first_name}
							bind:value={firstName}
						/>
					</div>
					<div class="flex flex-col mt-2 md:mt-0 md:ml-4">
						<span class="text-md font-medium pb-1"> Priezvisko </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
							type="text"
							autocomplete="family-name"
							disabled={!editPermissions.last_name}
							bind:value={lastName}
						/>
					</div>
				</div>
				<div class="flex flex-col md:flex-row pb-2">
					<div class="flex flex-col">
						<span class="text-md font-medium pb-1"> Email </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
							type="text"
							autocomplete="email"
							disabled={!editPermissions.email}
							bind:value={email}
						/>
					</div>
					<div class="flex flex-col mt-2 md:mt-0 md:ml-4">
						<span class="text-md font-medium pb-1"> Používateľské meno </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
							type="text"
							autocomplete="username"
							disabled={!editPermissions.username}
							bind:value={username}
						/>
					</div>
				</div>
				<div class="flex flex-col md:flex-row pb-2">
					<div class="flex flex-col">
						<span class="text-md font-medium pb-1"> Telefónne číslo </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed w-auto"
							type="tel"
							autocomplete="tel"
							disabled={!editPermissions.phone_number}
							bind:value={phone}
						/>
					</div>
					<div class="flex flex-col mt-2 md:mt-0 md:ml-4">
						<span class="text-md font-medium pb-1"> Trieda </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
							type="text"
							autocomplete="off"
							value={($userState.user?.clazz?.name ?? '') +
								(' (' + $userState.user?.clazz?.grade?.name + ')' ?? '')}
							disabled
						/>
					</div>
				</div>
				<div class="flex flex-col md:flex-row pb-2">
					<div class="flex flex-col">
						<span class="text-md font-medium pb-1"> ID Discord účtu </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
							type="text"
							autocomplete="off"
							disabled={!editPermissions.discord_id}
							bind:value={discord_id}
						/>
					</div>
					<div class="flex flex-col mt-2 md:mt-0 md:ml-4">
						<span class="text-md font-medium pb-1"> Microsoft účet </span>
						<input
							class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
							type="text"
							autocomplete="off"
							value={$userState.user?.microsoft_user ?? ''}
							disabled
						/>
					</div>
				</div>
				<div class="flex flex-col items-center justify-center py-2">
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
						<div class="flex items-center justify-center">
							<button
								class="flex items-center justify-center bg-green-500 hover:bg-green-600 text-zinc-100 font-bold py-2 px-4 rounded
									   mt-4 disabled:bg-green-400 disabled:hover:bg-green-400 dark:disabled:bg-green-700 dark:hover:bg-green-700 shadow-md"
								on:click={saveProfile}
								disabled={savingProfile}
							>
								{#if savingProfile}
									<Icon icon="mdi:loading" class="w-5 h-5 mr-2 animate-spin" />
									Ukladám...
								{:else}
									<Icon icon="mdi:content-save" class="w-5 h-5 mr-2" />
									Uložiť zmeny
								{/if}
							</button>
						</div>
					{/if}
				</div>
			</form>
			<form>
				<div class="flex flex-col items-center justify-center pt-5 pb-2">
					<h2 class="text-lg font-bold text-neutral-800 dark:text-neutral-200 pb-2">Zmena hesla</h2>
					<div class="flex flex-col md:flex-row items-start justify-center pb-2">
						<div class="flex flex-col">
							<input
								type="text"
								autocomplete="username"
								value={$userState.user?.username}
								style="display: none"
								disabled
							/>
							<span class="text-md font-medium pb-1"> Staré heslo </span>
							<input
								class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
								type="password"
								autocomplete="current-password"
								disabled={!editPermissions.password || !$userState.user?.has_password}
								bind:value={oldPassword}
							/>
							<span class="text-xs md:text-sm font-medium text-neutral-500 dark:text-neutral-400">
								{#if $userState.user?.has_password}
									Zadajte staré heslo, ak chcete zmeniť heslo.
								{:else}
									Ešte nemáte nastavené žiadne heslo.
								{/if}
							</span>
						</div>
						<div class="flex flex-col mt-2 md:mt-0 md:ml-4 justify-start">
							<span class="text-md font-medium pb-1"> Nové heslo </span>
							<input
								class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
								type="password"
								autocomplete="new-password"
								disabled={!editPermissions.password}
								bind:value={newPassword}
							/>
							<div class="pb-2" />
							<span class="text-md font-medium pb-1"> Nové heslo znova </span>
							<input
								class="text-lg font-bold pl-2 rounded bg-neutral-200 dark:bg-zinc-800 disabled:bg-zinc-350 disabled:dark:bg-neutral-500 disabled:cursor-not-allowed"
								type="password"
								autocomplete="new-password"
								disabled={!editPermissions.password}
								bind:value={newPasswordRepeat}
							/>
						</div>
					</div>
					{#if !editPermissions.password}
						<div class="text-red-500 text-md font-bold">
							Pre váš typ účtu nie je povolená zmena hesla.
						</div>
					{:else}
						<div class="flex items-center justify-center pb-2">
							<button
								class="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-zinc-100 font-bold py-2 px-4 rounded mt-4
								disabled:bg-blue-400 disabled:hover:bg-blue-400 dark:disabled:bg-blue-700 dark:hover:bg-blue-700 shadow-md"
								on:click={changePassword}
								disabled={changingPassword}
							>
								{#if changingPassword}
									<Icon icon="mdi:loading" class="w-5 h-5 mr-2 animate-spin" />
									Ukladám...
								{:else}
									<Icon icon="mdi:key" class="w-5 h-5 mr-2" />
									Zmeniť heslo
								{/if}
							</button>
						</div>
					{/if}
				</div>
			</form>
			<div class="flex flex-col items-center justify-center pt-3">
				<span class="text-lg font-bold pb-3"> Odhlásiť sa zo všetkých zariadení </span>
				<button
					class="flex items-center justify-center bg-red-500 hover:bg-red-600 text-zinc-100 font-bold py-2 px-4 rounded ml-2
					disabled:bg-red-400 disabled:hover:bg-red-400 dark:disabled:bg-red-700 dark:disabled:hover:bg-red-700 shadow-md"
					on:click={logoutAll}
					disabled={loggingOutAll}
				>
					{#if loggingOutAll}
						<Icon icon="mdi:loading" class="w-5 h-5 mr-2 animate-spin" />
						Odhlasujem...
					{:else}
						<Icon icon="mdi:logout-variant" class="w-6 h-6 mr-2" />
						Odhlásiť
					{/if}
				</button>
			</div>
		</div>
	{:else}
		<h3 class="text-neutral-800 dark:text-neutral-200 pb-4">Neprihlásený</h3>
		<a
			class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
			href="/auth/login">Prihlásiť</a
		>
	{/if}
{/await}
