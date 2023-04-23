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
	import { loginRequired } from '$lib/settings'
	import { userState } from '$lib/state'
	import { goto } from '$app/navigation'

	onMount(startConnectionCheck)

	/*
	 * If login is required:
	 * - Hides header, content and footer until userState is loaded
	 * - Redirects to login page if user is not logged in
	 * - If user is logged in, shows everything
	 */
	let showContent = !loginRequired
	let headerAndFooter = showContent
	if (loginRequired) {
		onMount(async () => {
			await userState.loaded
			showContent = true
			if (!$userState.loggedIn) {
				if (window.location.pathname !== '/auth/login') goto('/auth/login')
				else console.log('Already on login page')
			} else {
				headerAndFooter = true
			}
		})
	}
</script>

<main class="app flex flex-col" class:dark={$darkTheme}>
	{#if headerAndFooter}
		<Header />
	{/if}
	<Background>
		{#if showContent}
			<div class="flex-grow">
				<slot />
			</div>
		{/if}
	</Background>
	{#if headerAndFooter}
		<Footer />
	{/if}

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
