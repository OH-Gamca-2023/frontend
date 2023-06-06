<script lang="ts">
	import { userState } from '$lib/state'
	import type { Cipher } from '$lib/types'
	import timeAgo from '$lib/utils/timeago'

	export let cipher: Cipher
	export let solvingIndividually = false

	$: hintPublishTime = timeAgo.format(new Date(cipher.hint_publish_time ?? 0))
	$: hintPublishText = cipher.hint_publish_time
		? cipher.hint_visible
			? 'Nápoveda bola zverejnená'
			: 'Nápoveda bude zverejnená'
		: 'Nápoveda nebude zverejnená'
	$: endTime = timeAgo.format(new Date(cipher.end)).split(' ').splice(1).join(' ')
	$: endText = cipher.has_ended ? 'Skončila pred' : 'Na vyriešenie zostávajú'

	$: userClass = $userState.loggedIn ? $userState.user!.clazz : undefined
	$: classData = $userState.loggedIn ? cipher.classes.get(userClass!) : undefined
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
						class:from-green-500={cipher.started}
						class:to-green-400={cipher.started}
						class:from-yellow-500={cipher.hint_visible}
						class:to-yellow-400={cipher.hint_visible}
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
				{#if cipher.hint_publish_time}
					<span class="text-gray-600 dark:text-gray-300">{hintPublishText} {hintPublishTime}</span>
				{/if}
				<span class="text-gray-600 dark:text-gray-300">{endText} {endTime}</span>
			</div>
		</div>
	</div>
	<div class="flex flex-col text-right">
		{#if $userState.loggedIn && userClass}
			<span class="text-sm text-gray-500 dark:text-gray-400 pb-2">
				{#if solvingIndividually}
					Individuálne: {$userState.user?.username}
				{:else}
					Trieda: {userClass?.name}
				{/if}
			</span>
			<div class="flex-1">
				{#if classData?.solved}
					<span class="text-green-500 dark:text-green-400 text-lg font-bold">Vyriešené</span>
					{#if classData.after_hint}
						<span class="text-md text-yellow-500 dark:text-yellow-400">(po nápovede)</span>
					{/if}
				{:else}
					<span class="text-red-500 dark:text-red-500 text-lg font-bold">Nevyriešené</span>
				{/if}
			</div>
			<span class="text-sm text-gray-700 dark:text-gray-200"
				>Počet pokusov: {classData?.attempts ?? 'N/A'}</span
			>
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