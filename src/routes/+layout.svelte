<script lang="ts">
	import { page } from '$app/stores'
	import Header from '$lib/components/header/Header.svelte'
	import { darkTheme, prefs } from '$lib/data/prefs'
	import '../tailwind.css'
	import '../tooltip.css'
	import '../global.css'
	import Background from '$lib/components/Background.svelte'
	import Footer from '$lib/components/footer/Footer.svelte'
	import { ToastContainer, FlatToast } from 'svelte-toasts'
	import { startConnectionCheck } from '$lib/connection'
	import { onMount } from 'svelte'
	import { debugMode, loginRequired } from '$lib/data/settings'
	import { userState } from '$lib/state'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import {
		calendarData as calendar,
		categories,
		clazzes,
		disciplines,
		grades,
		posts,
		tags,
	} from '$lib/api/models'

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

	{#if $prefs.debugMode}
		<div class="fixed bottom-0 right-1/2 transform translate-x-1/2 flex flex-col items-center z-50">
			<div class="text-xs text-gray-400">
				Debug Mode Enabled {debugMode.force ? '(forced)' : ''}
			</div>
			<div class="text-xs text-gray-400">
				Ld {$userState.loading ? '1' : '0'} | L {$userState.loggedIn ? '1' : '0'} | U
				{$userState.user ? $userState.user.id : 'null'} | T {$userState.user
					? $userState.user.type
					: 'null'}
			</div>
			<div class="text-xs text-gray-400">
				{$page.url.pathname} | P {Object.keys($page.params).length > 0
					? Object.keys($page.params).map((k) => `${k}: ${$page.params[k]}`)
					: 'null'}
			</div>
			<div class="text-xs text-gray-400">
				G {#await grades.load()}...{:then}{Object.keys($grades).length}{:catch}e{/await}
				| Cl {#await clazzes.load()}...{:then}{Object.keys($clazzes).length}{:catch}e{/await}
				| T {#await tags.load()}...{:then}{Object.keys($tags).length}{:catch}e{/await}
				| Ca {#await categories.load()}...{:then}{Object.keys($categories).length}{:catch}e{/await}
				| P {#await posts.load()}...{:then}{Object.keys($posts).length}{:catch}e{/await}
				| D {#await disciplines.load()}...{:then}{Object.keys($disciplines).length}{:catch}e{/await}
				| Cal {#await calendar.load()}...{:then}{$calendar[0].events.length}{:catch}e{/await}
			</div>
		</div>
	{/if}
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
