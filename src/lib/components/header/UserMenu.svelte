<script context="module" lang="ts">
	export const userRoleDict = {
		admin: ['Administrátor', 'clarity:administrator-solid'],
		organizer: ['Organizátor', 'wpf:administrator'],
		teacher: ['Učiteľ', 'vaadin:academy-cap'],
		student: ['Študent', 'wpf:name'],
		unknown: ['Unknown', 'carbon:unknown-filled'],
	}
</script>

<script lang="ts">
	import Icon from '@iconify/svelte'
	import { userState } from '$lib/state'
	import Spinner from '$lib/components/Spinner.svelte'
	import { goto } from '$app/navigation'
</script>

{#if $userState.loading}
	<div id="user-menu" class="flex flex-row items-center justify-center">
		<Spinner class="h-12 w-12 p-2" />
	</div>
{:else if $userState.loggedIn}
	<div
		id="user-menu"
		class="flex flex-row items-center justify-center"
		on:click={() => goto('/auth/profile')}
		on:keypress={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				goto('/auth/profile')
			}
		}}
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
		<a
			id="logout"
			href="/auth/logout"
			class="flex flex-row items-center justify-center"
			data-tooltip="Odhlásiť sa"
		>
			<Icon icon="carbon:logout" class="h-6 w-6 ml-2" />
		</a>
	</div>
{:else}
	<a id="login" href="/auth/login" class="flex flex-row items-center justify-center cursor-pointer">
		<Icon icon="carbon:login" class="h-6 w-6 mr-2" />
		Prihlásiť sa
	</a>
{/if}
