<script lang="ts">
	import type { Sidebar } from '$lib/types'
	import Icon from '$lib/components/Icon.svelte'
	import Taglist from '../tags/Taglist.svelte'
	import { userState } from '$lib/state'

	let sidebarQuery = (async () => {
		const { getSidebar } = await import('$lib/api')
		return await getSidebar()
	})()
	let resolvedSidebar: Sidebar | null = null

	sidebarQuery.then((result) => {
		if (result.error) {
			console.error(result)
		} else {
			resolvedSidebar = result.data ?? null
		}
	})
</script>

<div class="pt-4 flex flex-col gap-2 min-w-[16rem]">
	<div class="flex flex-col">
		<span class="font-bold text-lg text-center border-b border-gray-500 dark:border-gray-400"
			>Najbližšie disciplíny
		</span>
		{#await sidebarQuery}
			<div class="flex items-center justify-center gap-2 py-1">
				<Icon icon="mdi:loading" class="animate-spin w-8 h-8" />
				<span class="font-medium">Načítavam...</span>
			</div>
		{:then sidebar}
			{#if sidebar.error}
				<div class="flex items-center justify-center gap-2 py-1">
					<Icon icon="mdi:alert-circle-outline" class="w-8 h-8" />
					<span class="font-medium">Nepodarilo sa načítať</span>
				</div>
			{:else if resolvedSidebar}
				{#each resolvedSidebar.upcoming as discipline}
					<svelte:element
						this={discipline.details_published ? 'a' : 'div'}
						href={discipline.details_published ? `/discipline/${discipline.id}` : undefined}
						class="flex p-2 rounded-lg gap-4
						{discipline.details_published ? 'hover:bg-gray-200 dark:hover:bg-slate-600' : 'cursor-not-allowed'}"
					>
						<div class="flex flex-col gap-1 w-full">
							<div class="flex justify-between gap-4">
								<span class="font-semibold">{discipline.name}</span>
								<div class="flex flex-col text-right">
									{#if discipline.date}
										<div class="flex gap-1 items-center justify-end">
											<span
												>{String(discipline.date.getDate()).padStart(2, '0')}. {String(
													discipline.date.getMonth() + 1,
												).padStart(2, '0')}. {discipline.date.getFullYear()}</span
											>
											<Icon icon="mdi:calendar" class="h-4 w-4" />
										</div>
									{/if}
									{#if discipline.start_time}
										<div class="flex gap-1 items-center justify-end">
											<span
												>{#if discipline.end_time}
													{String(discipline.start_time.getHours()).padStart(2, '0')}:{String(
														discipline.start_time.getMinutes(),
													).padStart(2, '0')}&nbsp;-&nbsp;{String(
														discipline.end_time.getHours(),
													).padStart(2, '0')}:{String(discipline.end_time.getMinutes()).padStart(
														2,
														'0',
													)}
												{:else}
													{String(discipline.start_time.getHours()).padStart(2, '0')}:{String(
														discipline.start_time.getMinutes(),
													).padStart(2, '0')}
												{/if}
											</span>
											<Icon icon="mdi:clock-outline" class="h-4 w-4" />
										</div>
									{/if}
								</div>
							</div>
							<div class="flex justify-between gap-1 items-center">
								<Taglist {discipline} alwaysSmall={true} />
								{#if discipline.details_published}
									<Icon icon="mdi:book-open-page-variant" class="h-4 w-4" />
								{/if}
							</div>
						</div>
					</svelte:element>
				{:else}
					<div class="flex items-center justify-center gap-2 py-1">
						<span class="font-medium">Nenašli sa žiadne disciplíny</span>
					</div>
				{/each}
				{#if $userState.user?.clazz.grade.competing}
					<i class="text-gray-500 dark:text-gray-400 text-center pt-1">
						Zobrazujú sa iba disciplíny, ktoré sú pre tvoj stupeň
					</i>
				{/if}
			{:else}
				<div class="flex items-center justify-center gap-2 py-1">
					<Icon icon="mdi:alert-circle-outline" class="w-8 h-8" />
					<span class="font-medium">Obsah sa nenašiel</span>
				</div>
			{/if}
		{/await}
	</div>

	{#await sidebarQuery then _}
		{#if resolvedSidebar && resolvedSidebar.organising && resolvedSidebar.organising.length > 0}
			<div class="flex flex-col pt-3">
				<span class="font-bold text-lg text-center border-b border-gray-500 dark:border-gray-400"
					>Najbližšie disciplíny ktoré organizuješ
				</span>
				{#each resolvedSidebar.organising as discipline}
					<svelte:element
						this={discipline.details_published ? 'a' : 'div'}
						href={discipline.details_published ? `/discipline/${discipline.id}` : undefined}
						class="flex p-2 rounded-lg gap-4
						{discipline.details_published ? 'hover:bg-gray-200 dark:hover:bg-slate-600' : 'cursor-not-allowed'}"
					>
						<div class="flex flex-col gap-1 w-full">
							<div class="flex justify-between gap-4">
								<span class="font-semibold">{discipline.name}</span>
								<div class="flex flex-col text-right">
									{#if discipline.date}
										<div class="flex gap-1 items-center justify-end">
											<span
												>{String(discipline.date.getDate()).padStart(2, '0')}. {String(
													discipline.date.getMonth() + 1,
												).padStart(2, '0')}. {discipline.date.getFullYear()}</span
											>
											<Icon icon="mdi:calendar" class="h-4 w-4" />
										</div>
									{/if}
									{#if discipline.start_time}
										<div class="flex gap-1 items-center justify-end">
											<span
												>{#if discipline.end_time}
													{String(discipline.start_time.getHours()).padStart(2, '0')}:{String(
														discipline.start_time.getMinutes(),
													).padStart(2, '0')}&nbsp;-&nbsp;{String(
														discipline.end_time.getHours(),
													).padStart(2, '0')}:{String(discipline.end_time.getMinutes()).padStart(
														2,
														'0',
													)}
												{:else}
													{String(discipline.start_time.getHours()).padStart(2, '0')}:{String(
														discipline.start_time.getMinutes(),
													).padStart(2, '0')}
												{/if}
											</span>
											<Icon icon="mdi:clock-outline" class="h-4 w-4" />
										</div>
									{/if}
								</div>
							</div>
							<div class="flex justify-between gap-1 items-center">
								<Taglist {discipline} alwaysSmall={true} />
								{#if discipline.details_published}
									<Icon icon="mdi:book-open-page-variant" class="h-4 w-4" />
								{/if}
							</div>
						</div>
					</svelte:element>
				{:else}
					<div class="flex items-center justify-center gap-2 py-1">
						<span class="font-medium">Nenašli sa žiadne disciplíny</span>
					</div>
				{/each}
			</div>
		{/if}
	{/await}
</div>
