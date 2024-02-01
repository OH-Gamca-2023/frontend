<script lang="ts">
	import { browser } from '$app/environment'

	// import { getApiHost } from '$lib/data/api'
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
				cipher.task_file_ext ?? cipher.task_file?.split('.').pop() ?? '',
			),
		) ?? 'unknown'

	$: url =
		(cipher.task_file?.endsWith('/') ? cipher.task_file.slice(0, -1) : cipher.task_file) +
		'.' +
		cipher.task_file_ext
</script>

<div class="flex flex-col justify-center items-center">
	{#if !cipher.started || !cipher.task_file}
		Nepodarilo sa načítať zadanie šifry.
	{:else if fileType == 'image'}
		<img src={url} alt="Zadanie šifry" />
		<a href={url} target="_blank" rel="noopener noreferrer">
			<div class="italic underline">Stiahnuť zadanie</div>
		</a>
	{:else if fileType == 'document'}
		<iframe src={url} class="w-full h-full" style="min-height: 50vh;" title="Zadanie šifry" />
		<a href={url} target="_blank" rel="noopener noreferrer">
			<div class="italic underline">Stiahnuť zadanie</div>
		</a>
	{:else}
		<div class="text-2xl font-bold pb-2">Náhľad zadania nie je k dispozícii.</div>
		<a href={url} target="_blank" rel="noopener noreferrer">
			<div class="text-xl underline">Stiahnuť zadanie</div>
		</a>
	{/if}
</div>
