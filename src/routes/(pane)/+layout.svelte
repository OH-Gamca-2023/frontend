<script lang="ts">
	import Pane from '$lib/components/Pane.svelte'
</script>

<div class="flex flex-col items-center justify-center h-full">
	<div class="flex flex-col items-center justify-center min-w-96 max-w-screen">
		<Pane>
			<slot />
		</Pane>
	</div>
</div>
