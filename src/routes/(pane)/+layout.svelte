<script lang="ts">
	import Pane from '$lib/components/Pane.svelte'
</script>

<div class="flex flex-col items-center justify-center h-full">
	<div
		class="flex flex-col items-center justify-center min-w-96 max-w-screen md:max-w-[66.66%] lg:max-w-1/2 xl:max-w-[40%]"
	>
		<Pane>
			<slot />
		</Pane>
	</div>
</div>
