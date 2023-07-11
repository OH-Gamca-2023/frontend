<script lang="ts">
	import type { User } from '$lib/types'
	import Icon from './Icon.svelte'

	export let user: Partial<User>

	export let real_name = false
	export let email = true
	export let mail_subject = 'OH Gamča'
	export let phone = true
</script>

<div class="flex flex-col flex-1">
	<div class="flex flex-row justify-between items-center">
		<Icon icon="mdi:account" />
		{#if real_name}
			<span class="text-md">{user.first_name} {user.last_name}</span>
		{:else}
			<span class="text-md">{user.username}</span>
		{/if}
	</div>
	{#if email && user.email}
		<div class="flex flex-row justify-between items-center">
			<Icon icon="entypo:email" />
			<a
				class="text-md text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
				href="mailto:{user.email}{mail_subject ? `?subject=${mail_subject}` : ``}">{user.email}</a
			>
		</div>
	{/if}
	{#if phone && user.phone_number}
		<div class="flex flex-row justify-between items-center">
			<Icon icon="ph:phone-bold" />
			<a
				class="text-md text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
				href="tel:{user.phone_number}">{user.phone_number}</a
			>
		</div>
	{/if}
</div>
