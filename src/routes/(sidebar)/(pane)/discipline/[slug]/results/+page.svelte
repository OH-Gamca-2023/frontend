<script lang="ts">
	import type { Results } from '$lib/types'
	import type { PageData } from './$types'
	import { disciplines } from '$lib/api/models'
	import Taglist from '$lib/components/tags/Taglist.svelte'
	import { getDisciplineResults } from '$lib/api'
	import Icon from '$lib/components/Icon.svelte'

	import 'prismjs/themes/prism.min.css'
	import { gfmPlugin } from 'svelte-exmarkdown/gfm'
	import { highlightPlugin } from '$lib/prism'
	import Markdown from 'svelte-exmarkdown'

	export let data: PageData

	$: discipline = $disciplines[data.disciplineId]

	if (!discipline) disciplines.loadSingle(data.disciplineId)

	let resultPromise = getDisciplineResults(data.disciplineId)

	let results: (Results & { parsed?: Record<string, string> })[] = []

	;(async () => {
		const resp = await resultPromise
		if (resp.error || !resp.data || resp.data.length == 0) return

		for (const result of resp.data) {
			if (result.group_identical) {
				let parsed: Record<string, string> = {}
				let places = result.placements
					.filter((p) => p.participated)
					.map((p) => p.place)
					.filter((v, i, a) => a.indexOf(v) === i)
					.sort((a, b) => a - b)

				for (const place of places) {
					let amount = result.placements.filter((p) => p.place === place).length
					parsed[amount > 1 ? `${place}. - ${place + amount - 1}.` : `${place}.`] =
						result.placements
							.filter((p) => p.place === place)
							.map(
								(p) =>
									`${p.clazz.name.replace(' ', '&nbsp;')}<span class="italic">${
										p.detail ? `&nbsp;(${p.detail.replaceAll(' ', '&nbsp;')})` : ''
									}</span>`,
							)
							.join(', ')
				}

				results.push({
					...result,
					parsed,
				})
			} else {
				results.push(result)
			}
		}
	})()
</script>

<svelte:head>
	<title
		>{discipline ? 'Výsledky: ' + discipline.name : 'Výsledky disciplíny'} &centerdot; OH Gamča 2023</title
	>
</svelte:head>

<div class="w-full flex flex-col">
	{#if discipline}
		{#if !discipline.fromServer}
			<div
				class="flex items-center gap-1 dark:bg-yellow-600 border-l-4 dark:border-yellow-800 rounded rounded-r-lg p-2 mb-4
			bg-yellow-100 border-yellow-400"
			>
				<Icon icon="mdi:alert-circle-outline" class="w-5 h-5 md:w-6 md:h-6" />
				<span class="text-sm font-medium">Informácie o disciplíne môžu byť neaktuálne</span>
			</div>
		{/if}
		<div class="flex justify-center items-center pb-5">
			<div class="flex flex-col justify-center items-center">
				<a href="/disciplines/{discipline.id}">
					<Icon icon="ph:arrow-left-bold" class="w-10 h-10 lg:ml-5" />
				</a>
			</div>
			<div class="flex flex-col justify-center md:items-center flex-1">
				<span class="text-2xl font-bold pb-1 hidden md:inline"
					>Výsledky: <span class="font-medium">{discipline.name}</span></span
				>
				<span class="text-lg font-bold ml-5 md:hidden">Výsledky:</span>
				<span class="text-lg font-medium ml-5 pb-1 md:hidden">{discipline.name}</span>
				<Taglist {discipline} alwaysBig={true} class="justify-center" />
			</div>
		</div>
		<div class="flex flex-col w-full justify-center items-center">
			{#if discipline.results_published}
				{#await resultPromise}
					<div class="w-full h-12 bg-neutral-200 dark:bg-zinc-600 rounded animate-pulse relative" />
				{:then resultResponse}
					{#if resultResponse.error}
						<div class="text-red-500 text-xl font-bold text-center">
							Nastala chyba pri načítavaní výsledkov ({resultResponse.status})
						</div>
					{:else if !resultResponse.data || (resultResponse.data.length === 0 && !discipline.result_details)}
						<div class="text-amber-500 text-xl font-bold text-center">
							Žiadne výsledky neboli nájdené
						</div>
					{:else}
						<div class="flex flex-col gap-4">
							<div class="flex gap-4 w-full justify-center flex-wrap">
								{#each results as result}
									<div
										class="flex flex-col items-center bg-zinc-50 dark:bg-zinc-600 shadow-lg rounded-lg p-5 w-full max-w-[20rem]"
									>
										<div
											class="flex flex-col justify-center items-center border-b-2 border-zinc-200 dark:border-zinc-500 px-3 pb-3 mb-3"
										>
											{#if result.name}
												<span class="text-2xl font-bold">{result.name}</span>
											{/if}
											<Taglist
												tags={result.grades.map((grade) => grade.name)}
												class="justify-center"
											/>
										</div>
										<div class="flex flex-col justify-center items-center">
											{#if result.group_identical && result.parsed}
												{#each Object.entries(result.parsed) as [place, clazzes]}
													<div class="flex justify-center items-center text-xl">
														<span class="font-bold whitespace-nowrap">
															{place}
														</span>
														<span class="pl-3">
															{@html clazzes}
														</span>
													</div>
												{/each}
											{:else}
												{#each result.placements.filter((p) => p.participated) as placement}
													<div class="flex justify-center items-center text-xl">
														<span class="font-bold">
															{placement.place}.
														</span>
														<span class="pl-3">
															{placement.clazz.name}
															{#if placement.detail}
																<span class="italic">
																	{placement.detail}
																</span>
															{/if}
														</span>
													</div>
												{/each}
											{/if}
											<div
												class="flex flex-col justify-center items-center font-semibold pt-3 text-lg"
											>
												Nezúčastnili sa:
												{#if result.placements.filter((p) => !p.participated).length > 0}
													<span class="pl-2 font-medium">
														{@html result.placements
															.filter((p) => !p.participated)
															.map((p) => p.clazz.name.replace(' ', '&nbsp;'))
															.join(', ')}
													</span>
												{:else}
													<span class="pl-2 font-medium"> - </span>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
							{#if discipline.result_details && discipline.result_details.length > 0}
								<div class="prose prose-zinc dark:prose-invert">
									<Markdown md={discipline.result_details} plugins={[gfmPlugin, highlightPlugin]} />
								</div>
							{/if}
						</div>
					{/if}
				{/await}
			{:else}
				<div class="text-amber-500 text-xl font-bold text-center">
					Výsledky ešte neboli zverejnené
				</div>
			{/if}
		</div>
	{:else}
		<div class="w-full h-12 bg-neutral-200 dark:bg-zinc-600 rounded animate-pulse relative" />
	{/if}
</div>
