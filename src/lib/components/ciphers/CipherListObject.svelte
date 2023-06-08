<script lang="ts">
	import { userState } from '$lib/state'
	import type { Cipher } from '$lib/types'
	import timeAgo from '$lib/utils/timeago'

	export let cipher: Cipher
	export let solving = 'none'

	$: hintPublishTime = timeAgo.format(new Date(cipher.hint_publish_time ?? 0))
	$: hintPublishText = cipher.hint_publish_time
		? cipher.hint_visible
			? 'Nápoveda bola zverejnená'
			: 'Nápoveda bude zverejnená'
		: 'Nápoveda nebude zverejnená'
	$: endTime = timeAgo.format(new Date(cipher.end)).split(' ').splice(1).join(' ')
	$: endText = cipher.has_ended ? 'Skončila pred' : 'Na vyriešenie zostávajú'

	$: userClass = $userState.loggedIn ? $userState.user!.clazz : undefined
	$: data = $userState.loggedIn && solving != 'none' ? cipher.data : undefined
</script>

<a
	class="flex flex-row justify-between bg-gray-800 bg-opacity-0 hover:bg-opacity-5 hover:dark:bg-opacity-40 rounded-xl p-2 mb-2"
	href={cipher.started ? `/ciphers/${cipher.id}` : '#'}
	class:cursor-pointer={cipher.started}
	class:cursors-not-allowed={!cipher.started}
>
	<div class="flex flex-col">
		<div class="flex flex-row">
			<div class="flex flex-col justify-center mr-1 w-10">
				<div class="flex flex-row justify-center">
					<span
						class="rounded-full w-3 h-3 bg-gradient-to-tr"
						class:from-green-500={cipher.started && !cipher.hint_visible && !cipher.has_ended}
						class:to-green-400={cipher.started && !cipher.hint_visible && !cipher.has_ended}
						class:from-yellow-500={cipher.hint_visible && !cipher.has_ended}
						class:to-yellow-400={cipher.hint_visible && !cipher.has_ended}
						class:from-red-500={cipher.has_ended}
						class:to-red-400={cipher.has_ended}
					/>
				</div>
			</div>
			<span class="text-2xl font-bold inline-block">
				{cipher.name}
			</span>
		</div>
		<div class="flex flex-row pt-2">
			<div class="flex flex-col justify-center mr-3 w-10">
				<div class="flex flex-row justify-center">
					<span class="text-2xl font-bold text-gray-400 dark:text-gray-500 w-10 inline-block"
						>#{cipher.id}</span
					>
				</div>
			</div>
			<div class="flex flex-col">
				{#if cipher.hint_publish_time && !cipher.has_ended}
					<span class="text-sm md:text-md text-gray-600 dark:text-gray-300"
						>{hintPublishText} {hintPublishTime}</span
					>
				{/if}
				<span class="text-sm md:text-md pt-1 text-gray-600 dark:text-gray-300"
					>{endText} {endTime}</span
				>
			</div>
		</div>
	</div>
	<div class="flex flex-col text-right">
		{#if $userState.loggedIn && userClass}
			<span class="text-xs md:text-sm text-gray-500 dark:text-gray-400 pb-2 whitespace-nowrap">
				{#if solving == 'class'}
					Trieda: {userClass?.name}
				{:else}
					Individuálne: {$userState.user?.username}
				{/if}
			</span>
			{#if solving == 'none'}
				<div class="flex-1">
					<span class="text-gray-500 dark:text-gray-400 text-sm md:text-md font-bold"
						>Individuálne riešenie<br />nemáš povolené</span
					>
				</div>
			{:else}
				<div class="flex-1">
					{#if data?.solved}
						<span class="text-green-500 dark:text-green-400 text-md md:text-lg font-bold"
							>Vyriešené</span
						>
						{#if data.after_hint}
							<br class="block md:hidden" />
							<span
								class="text-sm md:text-md text-yellow-500 dark:text-yellow-400 whitespace-nowrap"
								>(po nápovede)</span
							>
						{/if}
					{:else}
						<span class="text-red-500 dark:text-red-500 text-md md:text-lg font-bold"
							>Nevyriešené</span
						>
					{/if}
				</div>
				<span class="text-xs md:text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap"
					>Počet pokusov: {data?.attempts ?? 'N/A'}</span
				>
			{/if}
		{:else if $userState.loggedIn}
			<span class="text-red-500 dark:text-red-400">Nastala chyba pri spracovaní údajov.</span>
		{:else}
			<span class="text-gray-500 dark:text-gray-400"
				>Pre odovzdanie riešenia<br />sa musíte prihlásiť.</span
			>
			<a
				href="/auth/login"
				class="block p-2 mt-2 text-center bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-900
                 rounded-md shadow-md">Prihlásiť sa</a
			>
		{/if}
	</div>
</a>
