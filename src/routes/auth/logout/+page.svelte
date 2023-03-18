<script lang="ts">
	import { goto } from '$app/navigation'
	import { userState } from '$lib/state'
	import { toast } from '$lib/toasts'

	let error = ''
	let message = 'Načítavajú sa údaje...'

	setTimeout(async () => {
		await userState.loaded
		if ($userState.loggedIn) {
			message = 'Prebieha odhlásenie, prosím čakajte...'
			const result = await userState.logout()
			if (result) {
				toast({
					title: 'Odhlásenie prebehlo úspešne',
					type: 'success',
					duration: 3000,
				})
			} else {
				toast({
					title: 'Boli ste odhlásený',
					message: 'Pri odhlásovaní nastala interná chyba, prosím nahláste ju administrátorovi',
					type: 'warning',
					duration: 3000,
				})
			}
			goto('/')
		} else {
			toast({
				title: 'Nie ste prihlásený',
				type: 'error',
				duration: 2000,
			})
			goto('/auth/login')
		}
	}, 50)
</script>

<svelte:head>
	<title>Odhlásenie</title>
</svelte:head>

<h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 pb-2">Odhlásenie</h1>

<h3 class="text-red-500 dark:text-red-400 pb-4">{error}</h3>

<h4 class="text-gray-800 dark:text-gray-200 pb-4">{message}</h4>
