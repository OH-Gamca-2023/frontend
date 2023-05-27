<script lang="ts">
	import CipherListObject from '$lib/components/ciphers/CipherListObject.svelte'
	import { ciphers } from '$lib/data/ciphers'

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
</script>

<div class="flex flex-col space-y-2 w-full">
	{#each listCiphers as cipher}
		<CipherListObject {cipher} />
	{/each}
</div>
