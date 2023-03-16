<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import { darkTheme } from '$lib/prefs'
	import '../tailwind.css'
	import '../global.css'
	import Background from '$lib/components/Background.svelte'
	import Footer from '$lib/components/footer/Footer.svelte'
	import Lipsum from '$lib/components/Lipsum.svelte'
</script>

<main class="app flex flex-col" class:dark={$darkTheme}>
	<Header />
	<Background>
		<slot />
	</Background>
	<Footer />
</main>

<style lang="scss">
	.app {
		min-height: 100vh;
		min-width: 100vw;
	}
</style>
