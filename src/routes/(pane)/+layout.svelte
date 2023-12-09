<script lang="ts">
	import Pane from '$lib/components/Pane.svelte'
</script>

<div class="flex flex-col items-center justify-center lmd:max-w-[50%]">
	<Pane>
		<slot />
	</Pane>
</div>
