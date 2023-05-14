<script lang="ts">
	import PostView from '$lib/components/PostView.svelte'
	import type { PageData } from './$types'
	import 'prismjs/themes/prism.min.css'
	import './markdown.css'

	export let data: PageData

	$: id = data.postId
</script>

<PostView {id} />
