<script lang="ts">
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte'
</script>

<div class="flex flex-col lg:flex-row w-full">
	<div
		class="flex flex-col items-center justify-center h-full basis-full lg:basis-4/6 xl:basis-3/4 my-3 md:mx-5 xl:mx-10"
	>
		<div
			class="
		flex flex-col items-center justify-center
		 p-4 bg-white rounded-lg shadow-lg w-full
		dark:bg-gray-800
	"
		>
			aaaaaaaaaaaa
			<slot />
		</div>
	</div>
	<div
		class="flex flex-col items-center justify-center h-full basis-full lg:basis-2/6 xl:basis-1/4 my-3 md:mx-5 xl:mx-10"
	>
		<div
			class="
		flex flex-col items-center justify-center
		p-4 bg-white rounded-lg shadow-lg w-full
		dark:bg-gray-800
	"
		>
			<Sidebar />
		</div>
	</div>
</div>
