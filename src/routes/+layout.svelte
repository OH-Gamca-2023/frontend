<script lang="ts">
	import Topbar from '$lib/components/topbar/Topbar.svelte'
	import '../tailwind.css'
</script>

<div class="app flex flex-col">
	<Topbar />
	<main>
		<slot />
	</main>
</div>

<style lang="scss">
	.app {
		min-height: 100vh;
		min-width: 100vw;

		& > main {
			flex: 1;
		}
	}
</style>
