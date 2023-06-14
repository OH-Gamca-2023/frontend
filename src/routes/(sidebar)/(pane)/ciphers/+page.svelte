<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import CipherListObject from '$lib/components/ciphers/CipherListObject.svelte'
	import { ciphers } from '$lib/api/models'
	import { userState } from '$lib/state'

	$: listCiphers = Object.values($ciphers)
		.sort((a, b) => {
			// prioritize ciphers with hint, then started and then ended
			if (a.hint_visible && !b.hint_visible) return -1
			if (!a.hint_visible && b.hint_visible) return 1

			if (a.started && !b.started) return -1
			if (!a.started && b.started) return 1

			if (a.has_ended && !b.has_ended) return 1
			if (!a.has_ended && b.has_ended) return -1

			return a.id - b.id
		})
		.filter((cipher) => cipher.started) // only show started ciphers

	$: solving =
		$userState.loggedIn && $userState.user
			? $userState.user.clazz.grade.cipher_competing
				? 'class'
				: $userState.user.individual_cipher_solving
				? 'individual'
				: 'none'
			: 'none'
</script>

<div class="flex flex-col space-y-2 w-full">
	{#await ciphers.load()}
		<div class="flex flex-row justify-center items-center space-x-2">
			<Icon icon="mdi:loading" class="w-10 h-10 animate-spin" />
			<span class="text-xl font-bold">Načítavam šifry...</span>
		</div>
	{:then _}
		{#if listCiphers.length === 0}
			<div class="flex flex-row justify-center items-center space-x-2">
				<Icon icon="mdi:stop-remove-outline" class="w-10 h-10" />
				<span class="text-xl font-bold">Žiadne šifry aktuálne nie sú dostupné.</span>
			</div>
		{:else}
			{#if $userState.loggedIn && $userState.user}
				{#if !$userState.user.clazz.grade.cipher_competing}
					<div class="flex flex-row justify-center items-center space-x-2">
						<Icon icon="mdi:emoticon-sad-outline" class="w-10 h-10 mr-2" />
						<div class="flex flex-col">
							<span class="text-xl font-bold">Tvoja trieda sa nezúčastuje tejto šifrovačky.</span>
							{#if solving === 'individual'}
								<span class="text-sm">Stále však môžeš riešiť šifry individuálne.</span>
							{/if}
						</div>
					</div>
				{/if}
			{/if}

			{#each listCiphers as cipher}
				<CipherListObject {cipher} {solving} />
			{/each}
		{/if}
	{/await}
</div>
