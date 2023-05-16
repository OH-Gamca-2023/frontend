<script lang="ts">
	import PostList from '$lib/components/PostList.svelte'
	import type { PageData } from '../$types'

	export let data: PageData

	$: filter = data.filter
</script>

<PostList {filter} />
