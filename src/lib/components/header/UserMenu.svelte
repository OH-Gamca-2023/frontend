<script context="module" lang="ts">
	export const userRoleDict = {
		admin: ['Administrátor', 'clarity:administrator-solid'],
		organiser: ['Organizátor', 'wpf:administrator'],
		teacher: ['Učiteľ', 'mdi:account-student'],
		student: ['Študent', 'wpf:name'],
		alumni: ['Absolvent', 'vaadin:academy-cap'],
		unknown: ['Unknown', 'carbon:unknown-filled'],
	}
</script>

<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { userState } from '$lib/state'
	import { slide } from 'svelte/transition'

	let userMenuOpen = false

	$: !$userState.loggedIn && (userMenuOpen = false)

	function handleBodyClick(e: MouseEvent) {
		if (userMenuOpen && !(e.target as HTMLElement).closest('#user-menu')) {
			userMenuOpen = false
		}
	}
</script>

<svelte:body on:click={handleBodyClick} />

{#if $userState.loading}
	<div id="user-menu" class="flex flex-row items-center justify-center">
		<Icon icon="mdi:loading" class="w-12 h-12 animate-spin" />
	</div>
{:else if $userState.loggedIn}
	<div id="user-menu" class="flex flex-row items-center justify-center relative">
		<button
			class="flex flex-row items-center justify-center cursor-pointer"
			on:click={() => (userMenuOpen = !userMenuOpen)}
		>
			<Icon icon={userRoleDict[$userState.user?.type ?? 'unknown'][1]} class="h-6 w-6 mr-2" />
			<div id="user-data" class="flex flex-col items-start justify-center mr-2 ml-2">
				<div id="user-name" class="text-sm font-medium">
					{$userState.user?.username ?? 'Neznámy'}
				</div>
				<div id="user-role" class="text-xs font-light">
					{userRoleDict[$userState.user?.type ?? 'unknown'][0]}
				</div>
			</div>
		</button>
		<a
			id="logout"
			href="/auth/logout"
			class="flex flex-row items-center justify-center"
			data-tooltip="Odhlásiť sa"
		>
			<Icon icon="carbon:logout" class="h-6 w-6 ml-2" />
		</a>
		<div class="absolute -bottom-3 left-0 right-0 z-10">
			{#if userMenuOpen && $userState.loggedIn}
				<div
					class="flex flex-col space-y-1 rounded-b-lg p-2 shadow-md absolute left-0 right-0
						from-zinc-200 to-zinc-300 dark:from-zinc-900 dark:to-zinc-950 z-10
						bg-gradient-to-b border border-zinc-300 dark:border-zinc-700 border-t-0"
					style="top: -3px"
					transition:slide={{ duration: 500 }}
				>
					<a
						href={`/auth/profile/`}
						class="flex flex-row space-x-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md p-1 justify-between"
						on:click={() => (userMenuOpen = false)}
					>
						<Icon icon="carbon:user-profile" class="h-6 w-6" />
						<span class="ml-2 text-sm font-medium">Profil</span>
					</a>
					<a
						href={`/preferences/`}
						class="flex flex-row space-x-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md p-1 justify-between"
						on:click={() => (userMenuOpen = false)}
					>
						<Icon icon="ph:wrench" class="h-6 w-6" />
						<span class="ml-2 text-sm font-medium">Nastavenia</span>
					</a>
					{#if $userState.user?.permissions.staff}
						<a
							href={`/admin/`}
							class="flex flex-row space-x-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md p-1 justify-between"
							on:click={() => (userMenuOpen = false)}
						>
							<div class="flex flex-row items-center justify-center">
								<Icon icon="carbon:settings" class="h-6 w-6" />
							</div>
							<span class="text-sm font-medium text-right">Organizátorské rozhranie</span>
						</a>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<a id="login" href="/auth/login" class="flex flex-row items-center justify-center cursor-pointer">
		<Icon icon="carbon:login" class="h-6 w-6 mr-2" />
		Prihlásiť sa
	</a>
{/if}
