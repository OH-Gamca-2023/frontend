<script lang="ts">
	import { page } from '$app/stores'
	import Header from '$lib/components/header/Header.svelte'
	import { darkTheme } from '$lib/data/prefs'
	import '../tailwind.css'
	import '../tooltip.css'
	import '../global.css'
	import Background from '$lib/components/Background.svelte'
	import Footer from '$lib/components/footer/Footer.svelte'
	import { ToastContainer, FlatToast } from 'svelte-toasts'
	import { startConnectionCheck } from '$lib/connection'
	import { onMount } from 'svelte'
	import { loginRequired } from '$lib/data/settings'
	import { userState } from '$lib/state'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'

	onMount(startConnectionCheck)

	$: headerAndFooter = !loginRequired || $userState.loggedIn
	$: showContent = headerAndFooter || $page.url.pathname.includes('auth/login')
	$: if (loginRequired && !$userState.loggedIn && !$userState.loading) {
		if ($page.url.pathname !== '/auth/login') {
			if (browser) goto('/auth/login')
		}
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
