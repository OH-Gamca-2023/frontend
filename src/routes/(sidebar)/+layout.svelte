<script lang="ts">
	import Pane from '$lib/components/Pane.svelte'
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte'
</script>

<div class="flex flex-col lg:flex-row w-full">
	<div
		class="flex flex-col items-center justify-center h-full basis-full lg:basis-4/6 xl:basis-3/4 my-3 md:mx-5 xl:mx-10"
	>
		<Pane>
			<slot />
		</Pane>
	</div>
	<div
		class="flex flex-col items-center justify-center h-full basis-full lg:basis-2/6 xl:basis-1/4 my-3 md:mx-5 xl:mx-10"
	>
		<Pane>
			<Sidebar />
		</Pane>
	</div>
</div>
