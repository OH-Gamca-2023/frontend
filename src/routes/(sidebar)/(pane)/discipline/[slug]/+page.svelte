<script lang="ts">
	import type { PageData } from './$types'
	import 'prismjs/themes/prism.min.css'
	import '../../../../../markdown.css'
	import DisciplineView from '$lib/components/DisciplineView.svelte'

	export let data: PageData

	$: id = data.disciplineId
</script>

<DisciplineView {id} />
