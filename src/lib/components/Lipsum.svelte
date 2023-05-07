<script lang="ts">
	import lipsum from '$lib/data/lipsum'

	export let paragraphs = -1
	export let words = -1

	let processed = ''
	$: {
		if (paragraphs > -1) {
			processed = lipsum.split('\n').slice(0, paragraphs).join('\n')
		} else if (words > -1) {
			processed = lipsum.split(' ').slice(0, words).join(' ')
		} else {
			processed = lipsum
		}
		processed = processed.replace(/\n/g, '</p><p>')
		processed = `<p>${processed}</p>`
	}
</script>

<div id="lipsum" class="lipsum">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html processed}
</div>
