<script lang="ts">
	import { page } from '$app/stores'
	import Pane from '$lib/components/Pane.svelte'
</script>

<div class="flex flex-col items-center justify-center">
	<Pane class="p-8">
		{#if $page.status === 404}
			<h1 class="text-2xl font-bold pb-4">404 - Stránka nenájdená</h1>
			<p class="text-lg">Stránka, ktorú hľadáte, neexistuje.</p>
			<p class="text-lg">Skontrolujte, či ste zadali správnu adresu.</p>
		{:else}
			<h1 class="text-2xl font-bold pb-4">Chyba</h1>
			<p class="text-lg">Pri načítaní stránky došlo k chybe.</p>
			<p class="text-lg">
				Skúste stránku znova načítať. Ak problém pretrváva, kontaktujte administrátora.
			</p>

			{#if $page.error}
				<span class="pt-4 text-sm text-gray-500 font-bold">Detaily chyby ({$page.status})</span>
				<pre class="text-sm text-gray-500">{JSON.stringify($page.error, null, 2)}</pre>
			{/if}
		{/if}
	</Pane>
</div>
