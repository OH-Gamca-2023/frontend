<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import { darkTheme } from '$lib/prefs'
	import '../tailwind.css'
	import '../global.css'
</script>

<div class="app flex flex-col" class:dark={$darkTheme}>
	<Header />
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
