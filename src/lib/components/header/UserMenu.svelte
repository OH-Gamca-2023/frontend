<script lang="ts">
	import Icon from '@iconify/svelte'
    import { state } from '$lib/state'
	import Spinner from '$lib/components/Spinner.svelte'

    const userRoleDict = {
        'admin': ['Administrátor', 'clarity:administrator-solid'],
        'organizer': ['Organizátor', 'wpf:administrator'],
        'teacher': ['Učiteľ', 'vaadin:academy-cap'],
        'student': ['Študent', 'wpf:name'],
        'unknown': ['Unknown', 'carbon:unknown-filled']
    }
</script>

{#if $state.loading}
    <div id="user-menu" class="flex flex-row items-center justify-center">
        <Spinner class="h-12 w-12 p-2" />
    </div>
{:else if $state.loggedIn}
    <div id="user-menu" class="flex flex-row items-center justify-center">
        <Icon icon={userRoleDict[$state.user?.type ?? 'unknown'][1]} class="h-6 w-6 mr-2" />
        <div id="user-data" class="flex flex-col items-start justify-center mr-2 ml-2">
            <div id="user-name" class="text-sm font-medium">
                {$state.user?.name ?? 'Neznámy'}
            </div>
            <div id="user-role" class="text-xs font-light">
                {userRoleDict[$state.user?.type ?? 'unknown'][0]}
            </div>
        </div>
        <a id="logout" href="/auth/logout" class="flex flex-row items-center justify-center" data-tooltip="Odhlásiť sa">
            <Icon icon="carbon:logout" class="h-6 w-6 ml-2" />
        </a>
    </div>
{:else}
    <a id="login" href="/auth/login" class="flex flex-row items-center justify-center cursor-pointer">
        <Icon icon="carbon:login" class="h-6 w-6 mr-2" />
        Prihlásiť sa
    </a>
{/if}