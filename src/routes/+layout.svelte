<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import { darkTheme } from '$lib/prefs'
	import '../tailwind.css'
	import '../global.css'
	import Background from '$lib/components/Background.svelte'
	import Footer from '$lib/components/footer/Footer.svelte'
	import { ToastContainer, FlatToast } from 'svelte-toasts'
	import { startConnectionCheck } from '$lib/connection'
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	import { page } from '$app/stores'

	onMount(startConnectionCheck)
</script>

<main class="app flex flex-col" class:dark={$darkTheme}>
	<Header />
	<Background>
		{#key $page.url}
			<div class="flex-grow" in:fade={{ duration: 300 }}>
				<slot />
			</div>
		{/key}
	</Background>
	<Footer />

	<ToastContainer let:data>
		<FlatToast {data} />
	</ToastContainer>
</main>

<style lang="scss">
	.app {
		min-height: 100vh;
		min-width: 100vw;

		&.dark {
			color: #fff;
		}
	}
</style>
