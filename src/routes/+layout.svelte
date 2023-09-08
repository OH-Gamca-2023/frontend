<script lang="ts">
	import { page } from '$app/stores'
	import Header from '$lib/components/header/Header.svelte'
	import '../tailwind.css'
	import '../tooltip.css'
	import '../global.css'
	import Background from '$lib/components/Background.svelte'
	import Footer from '$lib/components/footer/Footer.svelte'
	import { ToastContainer, FlatToast } from 'svelte-toasts'
	import { startConnectionCheck } from '$lib/connection'
	import { onMount } from 'svelte'
	import { darkTheme, settings, isOverridden } from '$lib/data/settings'
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
	import { initConsoleLog } from '$lib/utils/consoleLog'
	import { alerts } from '$lib/api/models/alerts'
	import Icon from '$lib/components/Icon.svelte'

	initConsoleLog()
	onMount(startConnectionCheck)

	$: alertList = Object.values($alerts)

	$: loginRequired = $settings.requireLogin.value

	$: headerAndFooter =
		(!loginRequired || $userState.loggedIn) && !$page.url.pathname.includes('auth/login/callback')
	$: showContent =
		headerAndFooter ||
		$page.url.pathname.includes('auth/login') ||
		$page.url.pathname.includes('debug')
	$: if (loginRequired && !$userState.loggedIn && !$userState.loading) {
		if (!$page.url.pathname.includes('auth/login') && !$page.url.pathname.includes('debug')) {
			if (browser) goto('/auth/login')
		}
	}

	function processSW() {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.oncontrollerchange = () => {
				console.log('Controller changed detected, reloading page')
				window.location.reload()
			}

			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					console.log('SW registered: ', registration)
				})
				.catch((registrationError) => {
					console.warn('SW registration failed: ', registrationError)
				})

			navigator.serviceWorker.ready.then((registration) => {
				console.log('SW ready: ', registration)
				registration.update()
				setInterval(
					() => {
						registration.update()
					},
					1000 * 60 * 60 * 12,
				)
			})
		} else {
			console.warn('Service worker not supported')
		}
	}
</script>

<svelte:window on:load={processSW} />

<main class="app flex flex-col" class:dark={$darkTheme}>
	{#if headerAndFooter}
		<Header />
	{/if}
	<Background>
		{#if showContent}
			{#if headerAndFooter}
				<div class="flex flex-col -mt-6 mb-6 pt-2 md:p-4 w-full text-sm md:text-base">
					{#each alertList as alert}
						<div
							class="flex items-center gap-1 border-l-4 rounded rounded-r-lg p-2 mb-2 last:mb-0 {alert
								.typeDetails?.classes}"
						>
							<Icon
								class="w-6 h-6 mr-1"
								icon={alert.typeDetails?.icon ?? 'mdi:exclamation-circle'}
							/>
							<h1 class="font-medium">{alert.message}</h1>
						</div>
					{/each}
				</div>
			{/if}
			<div class="flex flex-grow justify-center">
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

	{#if $settings.debugMode.value}
		<div
			class="fixed bottom-0 right-1/2 transform translate-x-1/2 flex flex-col items-center text-center z-50 text-xs text-neutral-800 dark:text-neutral-400"
		>
			<a href="/debug">
				Debug Mode Enabled {isOverridden('debugMode') ? '(Overriden)' : ''}
			</a>
			<p>
				Ld {$userState.loading ? '1' : '0'} | L {$userState.loggedIn ? '1' : '0'} | U
				{$userState.user ? $userState.user.id : 'null'} | T {$userState.user
					? $userState.user.type
					: 'null'}
			</p>
			<p>
				{$page.url.pathname} | P {Object.keys($page.params).length > 0
					? Object.keys($page.params).map((k) => `${k}: ${$page.params[k]}`)
					: 'null'}
			</p>
			<p>
				G {#await grades.load()}...{:then}{Object.keys($grades).length}{:catch}e{/await}
				| Cl {#await clazzes.load()}...{:then}{Object.keys($clazzes).length}{:catch}e{/await}
				| T {#await tags.load()}...{:then}{Object.keys($tags).length}{:catch}e{/await}
				| Ca {#await categories.load()}...{:then}{Object.keys($categories).length}{:catch}e{/await}
				| P {#await posts.load()}...{:then}{Object.keys($posts).length}{:catch}e{/await}
				| D {#await disciplines.load()}...{:then}{Object.keys($disciplines).length}{:catch}e{/await}
				| Cal {#await calendar.load()}...{:then}{$calendar[0].events.length}{:catch}e{/await}
			</p>
		</div>
	{/if}
</main>

<style lang="scss">
	.app {
		min-height: 100vh;

		&.dark {
			color: #fff;
		}
	}
</style>
