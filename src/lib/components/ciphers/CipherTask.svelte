<script lang="ts">
	import { getApiHost } from '$lib/data/api'
	import type { Cipher } from '$lib/types'

	export let cipher: Cipher

	const fileTypes = {
		image: ['png', 'jpg', 'jpeg'],
		text: ['txt'],
		document: ['pdf'],
	}
	$: fileType =
		Object.keys(fileTypes).find((type) =>
			fileTypes[type as 'image' | 'text' | 'document'].includes(
				cipher.task_file?.split('.').pop() ?? '',
			),
		) ?? 'unknown'
</script>

{#if !cipher.started || !cipher.task_file}
	Nepodarilo sa načítať zadanie šifry.
{:else if fileType == 'image'}
	<img src={getApiHost() + '/..' + cipher.task_file} alt="Zadanie šifry" />
{:else if fileType == 'document'}
	<iframe
		src={getApiHost() + '/..' + cipher.task_file}
		class="w-full h-full"
		style="min-height: 50vh;"
		title="Zadanie šifry"
	/>
{:else}
	<div class="flex flex-col justify-center items-center">
		<div class="text-3xl font-bold pb-2">Náhľad zadania nie je k dispozícii.</div>
		<a href={getApiHost() + '/..' + cipher.task_file} target="_blank" rel="noopener noreferrer">
			<div class="text-2xl underline">Stiahnuť zadanie</div>
		</a>
	</div>
{/if}
