<script lang="ts">
	import lipsum from '$lib/data/lipsum'

	export let paragraphs: number = -1
	export let words: number = -1

	let processed: string = ''
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
	{@html processed}
</div>
