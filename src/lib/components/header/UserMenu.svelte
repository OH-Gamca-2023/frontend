<script context="module" lang="ts">
	export const userRoleDict = {
		admin: ['Administrátor', 'mdi:account-cog'],
		organiser: ['Organizátor', 'mdi:account-tie'],
		teacher: ['Učiteľ', 'mdi:account-student'],
		student: ['Študent', 'mdi:account'],
		alumni: ['Absolvent', 'mdi:school'],
		unknown: ['Unknown', 'mdi:account-question-outline'],
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
	<div id="user-menu" class="flex items-center justify-center">
		<Icon icon="mdi:loading" class="w-12 h-12 animate-spin" />
	</div>
{:else if $userState.loggedIn}
	<div id="user-menu" class="flex items-center justify-center relative">
		<button
			class="flex items-center justify-center cursor-pointer"
			on:click={() => (userMenuOpen = !userMenuOpen)}
		>
			<Icon icon={userRoleDict[$userState.user?.type ?? 'unknown'][1]} class="h-8 w-8 mr-1" />
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
			class="flex items-center justify-center"
			data-tooltip="Odhlásiť sa"
		>
			<Icon icon="mdi:logout" class="h-6 w-6 ml-2" />
		</a>
		<div class="absolute -bottom-3 left-0 right-0 z-10">
			{#if userMenuOpen && $userState.loggedIn}
				<div
					class="flex flex-col space-y-1 rounded-b-lg p-2 shadow-md absolute left-0 right-0
						from-zinc-200 to-zinc-300 dark:from-zinc-900 dark:to-zinc-950 z-10
						bg-gradient-to-b border border-zinc-300 dark:border-zinc-700 border-t-0
						[&>*]:justify-between [&>*]:items-center -top-[2px]"
					transition:slide={{ duration: 500 }}
				>
					<a
						href={`/auth/profile/`}
						class="flex gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-750 rounded-md p-1"
						on:click={() => (userMenuOpen = false)}
					>
						<Icon icon="mdi:account-details-outline" class="h-7 w-7" />
						<span class="ml-2 text-sm font-medium">Profil</span>
					</a>
					<a
						href={`/preferences/`}
						class="flex gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-750 rounded-md p-1"
						on:click={() => (userMenuOpen = false)}
					>
						<Icon icon="mdi:wrench-outline" class="h-7 w-7" />
						<span class="ml-2 text-sm font-medium">Nastavenia</span>
					</a>
					{#if $userState.user?.permissions.staff}
						<a
							href={`/admin/`}
							class="flex gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-750 rounded-md p-1"
							on:click={() => (userMenuOpen = false)}
						>
							<Icon icon="mdi:cog-outline" class="h-10 w-10" />
							<span class="text-sm font-medium text-right">Organizátorské rozhranie</span>
						</a>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<a id="login" href="/auth/login" class="flex items-center justify-center cursor-pointer">
		<Icon icon="mdi:login" class="h-6 w-6 mr-2" />
		Prihlásiť sa
	</a>
{/if}
