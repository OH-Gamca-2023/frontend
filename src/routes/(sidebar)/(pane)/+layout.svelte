<script lang="ts">
	import Pane from '$lib/components/Pane.svelte'
</script>

<div class="flex flex-col items-center justify-center h-full w-full">
	<div class="flex flex-col items-center justify-center w-full">
		<Pane>
			<slot />
		</Pane>
	</div>
</div>
