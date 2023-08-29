<script lang="ts">
	import type { PageData } from './$types'
	import 'prismjs/themes/prism.min.css'
	import '../../../../../markdown.css'

	import { disciplines } from '$lib/api/models'
	import Icon from '$lib/components/Icon.svelte'
	import { userState } from '$lib/state'
	import Taglist from '$lib/components/tags/Taglist.svelte'
	import Person from '$lib/components/Person.svelte'
	import { getDisciplineResults, modifyPrimaryOrganisers, modifyTeacherSupervisors } from '$lib/api'
	import { toast } from '$lib/utils/toasts'

	export let data: PageData

	$: discipline = $disciplines[data.disciplineId]
	let loadingFailed = false
	let notFound = false
	if (!discipline)
		disciplines
			.loadSingle(data.disciplineId)
			.catch((e) => ((loadingFailed = true), (notFound = `${e}`.includes('not found'))))

	$: is_primary =
		discipline?.primary_organisers?.map((e) => e.id).includes($userState.user?.id) ?? false
	let primary_loading = false
	$: is_supervisor =
		discipline?.teacher_supervisors?.map((e) => e.id).includes($userState.user?.id) ?? false
	let supervisor_loading = false

	async function primary_click() {
		primary_loading = true
		const was_primary = is_primary
		const resp = await modifyPrimaryOrganisers(discipline!.id, is_primary ? 'remove' : 'add')
		if (resp.status == 200) {
			toast({
				title: was_primary
					? 'Boli ste odstránení zo zodpovedných organizátorov'
					: 'Boli ste pridaní medzi zodpovedných organizátorov',
				type: 'success',
				duration: 5000,
			})
		} else {
			toast({
				title: 'Nastla chyba pri spracovaní operácie',
				type: 'error',
				duration: 5000,
			})
		}
		primary_loading = false
	}
	async function supervisor_click() {
		supervisor_loading = true
		const was_supervisor = is_supervisor
		const resp = await modifyTeacherSupervisors(discipline!.id, is_supervisor ? 'remove' : 'add')
		if (resp.status == 200) {
			toast({
				title: was_supervisor
					? 'Boli ste odstránení z dozorujúcich učiteľov'
					: 'Boli ste pridaní medzi dozorujúcich učiteľov',
				type: 'success',
				duration: 5000,
			})
		} else {
			toast({
				title: 'Nastla chyba pri spracovaní operácie',
				type: 'error',
				duration: 5000,
			})
		}
		supervisor_loading = false
	}
	$: resultPromise = discipline?.results_published
		? getDisciplineResults(data.disciplineId)
		: undefined
</script>

<svelte:head>
	<title>{discipline?.name ?? 'Disciplína'} &centerdot; OH Gamča 2023</title>
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
		{#if !(discipline.date_published || discipline.details_published || discipline.results_published)}
			<div
				class="flex items-center gap-1 dark:bg-yellow-600 border-l-4 dark:border-yellow-800 rounded rounded-r-lg p-2 mb-4
				bg-yellow-100 border-yellow-400"
			>
				<Icon icon="mdi:alert-circle-outline" class="w-5 h-5 md:w-6 md:h-6" />
				<span class="text-sm font-medium"
					>Informácie o disciplíne sú viditeľné iba pre organizátorov</span
				>
			</div>
		{/if}
		<div class="flex justify-center items-center pb-5">
			<div class="flex flex-col justify-center items-center">
				<span class="text-3xl font-bold pb-1">{discipline.name}</span>
				<Taglist {discipline} alwaysBig={true} class="justify-center" />
			</div>
		</div>
		<div class="flex flex-col space-y-5 2xl:space-y-0 2xl:flex-row flex-wrap pt-2">
			<div class="flex flex-col basis-1/2 2xl:basis-1/5 2xl:mr-5">
				<div class="flex flex-col">
					<span class="text-xl font-bold">Čas a miesto</span>
					<div class="flex flex-col space-y-1 pt-1">
						{#if discipline.date}
							<div class="flex space-x-1">
								<Icon icon="mdi:calendar" />
								<span class="text-sm"
									>{String(discipline.date.getDate()).padStart(2, '0')}. {String(
										discipline.date.getMonth() + 1,
									).padStart(2, '0')}. {discipline.date.getFullYear()}</span
								>
							</div>
						{/if}
						{#if discipline.start_time}
							<div class="flex space-x-1">
								<Icon icon="mdi:clock-outline" />
								<span class="text-sm"
									>{#if discipline.end_time}
										{String(discipline.start_time.getHours()).padStart(2, '0')}:{String(
											discipline.start_time.getMinutes(),
										).padStart(2, '0')}&nbsp;-&nbsp;{String(
											discipline.end_time.getHours(),
										).padStart(2, '0')}:{String(discipline.end_time.getMinutes()).padStart(2, '0')}
									{:else}
										{String(discipline.start_time.getHours()).padStart(2, '0')}:{String(
											discipline.start_time.getMinutes(),
										).padStart(2, '0')}
									{/if}
								</span>
							</div>
						{/if}
						{#if discipline.location}
							<div class="flex space-x-1">
								<Icon icon="mdi:map-marker" />
								<span class="text-sm">{discipline.location}</span>
							</div>
						{/if}
						{#if !(discipline.date || discipline.start_time || discipline.location)}
							<div class="text-amber-500 font-bold">Informácie neboli nájdené</div>
						{/if}
					</div>
				</div>
				{#if discipline.results_published}
					<div class="felx flex-col pt-5">
						<div class="text-xl font-bold pb-2">Výsledky</div>
						{#if resultPromise}
							{#await resultPromise}
								<div
									class="w-full h-6 bg-gray-200 dark:bg-slate-600 rounded animate-pulse relative"
								/>
							{:then resultResponse}
								{#if resultResponse.error}
									<div class="text-red-500 font-bold">
										Nastala chyba pri načítavaní výsledkov ({resultResponse.status})
									</div>
								{:else if !resultResponse.data || resultResponse.data.length === 0}
									<div class="text-amber-500 font-bold">Žiadne výsledky neboli nájdené</div>
								{:else}
									<div
										class="flex flex-col divide-y-4 divide-zinc-200 dark:divide-slate-500 divide-dotted"
									>
										{#each resultResponse.data as results}
											{@const top3 = results.placements.filter((p) => p.participated).slice(0, 3)}
											<div class="flex flex-col p-3">
												{#if results.name}
													<div class="font-semibold pb-1">{results.name}</div>
												{/if}
												<Taglist
													tags={results.grades.map((g) => g.name)}
													class="pt-0 border-b border-zinc-200 dark:border-slate-500 pb-3 mb-1"
												/>
												<div class="flex flex-col relative">
													{#each top3 as placement}
														<div class="">
															<span class="font-semibold pr-2">{placement.place}.</span>
															<span class="font-medium">{placement.clazz.name}</span>
														</div>
													{/each}
													{#each Array(3 - top3.length) as _, i}
														<div class="">
															<span class="font-semibold pr-2">{i + top3.length + 1}.</span>
															<span class="font-medium">...</span>
														</div>
													{/each}

													<div
														class="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-slate-700"
													/>
												</div>
												<div class="border-t border-zinc-200 dark:border-slate-500 pt-1 mt-1">
													<a
														href="/discipline/{discipline.id}/results/"
														class="text-lg font-bold text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
														>Kompletné výsledky</a
													>
												</div>
											</div>
										{/each}
									</div>
								{/if}
							{/await}
						{:else}
							<div class="text-red-500 text-lg font-bold text-center">
								Stránka sa dostala do neplatného stavu
							</div>
						{/if}
					</div>
				{/if}
			</div>
			<div class="flex flex-col flex-1">
				<span class="text-xl font-bold">Detaily</span>
				{#if discipline.details_published}
					{#if discipline.details.length > 0}
						{discipline.details}
					{:else}
						<div class="text-red-500 text-lg font-bold">Nastala chyba pri spracovaní údajov</div>
					{/if}
				{:else}
					<div class="text-amber-500 text-lg font-bold">Informácie ešte neboli zverejnené</div>
				{/if}
			</div>
			{#if $userState.loggedIn && $userState.user && ($userState.user.permissions.staff || $userState.user.permissions.teacher)}
				<div class="flex flex-col basis-1/2 2xl:basis-1/3 2xl:ml-5">
					<div class="flex flex-col">
						<span class="text-xl font-bold">Zodpovední organizátori</span>
						<div
							class="flex flex-col rounded-md border border-b-0 border-gray-300 dark:border-gray-500 mt-5"
						>
							{#if discipline.primary_organisers && discipline.primary_organisers.length > 0}
								{#each discipline.primary_organisers as organiser}
									{#if organiser}
										<div
											class="bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400 border-b border-gray-300 dark:border-gray-500 flex"
										>
											<Person
												user={organiser}
												mail_subject={`OH Gamča - ${discipline.name}`}
												real_name={true}
											/>
										</div>
									{/if}
								{/each}
							{:else}
								<div
									class="flex justify-between items-center bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500"
								>
									<Icon icon="octicon:x-12" />
									<span class="text-md">Zatiaľ nikto</span>
								</div>
							{/if}

							{#if $userState.user.clazz.grade.is_organiser}
								{#if primary_loading}
									<div
										class="flex justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
						border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
									>
										<Icon icon="mdi:loading" class="w-6 h-6 animate-spin" />
										Spracúvam...
									</div>
								{:else if is_primary}
									<button
										class="flex justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
										on:click={primary_click}
									>
										<Icon icon="octicon:x-12" class="w-6 h-6" />
										Odhlásiť sa
									</button>
								{:else}
									<button
										class="flex justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
										on:click={primary_click}
									>
										<Icon icon="typcn:plus" class="w-6 h-6" />
										Pridať sa
									</button>
								{/if}
							{:else}
								<div
									class="flex justify-between items-center bg-opacity-20 p-2 bg-gray-400
							border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-not-allowed"
								>
									<Icon icon="mdi:stop-remove-outline" />
									Nie si organizátor
								</div>
							{/if}
						</div>
					</div>
					<div class="hidden flex-col pt-4">
						<span class="text-xl font-bold">Učiteľský dozor</span>
						<div
							class="flex flex-col rounded-md border border-b-0 border-gray-300 dark:border-gray-500 mt-5"
						>
							{#if discipline.teacher_supervisors && discipline.teacher_supervisors.length > 0}
								{#each discipline.teacher_supervisors as teacher}
									{#if teacher}
										<div
											class="bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400 border-b border-gray-300 dark:border-gray-500 flex"
										>
											<Person
												user={teacher}
												mail_subject={`OH Gamča - ${discipline.name}`}
												real_name={true}
											/>
										</div>
									{/if}
								{/each}
							{:else}
								<div
									class="flex justify-between items-center bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500"
								>
									<Icon icon="octicon:x-12" />
									<span class="text-md">Zatiaľ nikto</span>
								</div>
							{/if}

							{#if $userState.user.clazz.grade.is_teacher}
								{#if supervisor_loading}
									<div
										class="flex justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
						border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
									>
										<Icon icon="mdi:loading" class="w-6 h-6 animate-spin" />
										Spracúvam...
									</div>
								{:else if is_supervisor}
									<button
										class="flex justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
										on:click={supervisor_click}
									>
										<Icon icon="octicon:x-12" />
										Odhlásiť sa
									</button>
								{:else}
									<button
										class="flex justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
										on:click={supervisor_click}
									>
										<Icon icon="typcn:plus" />
										Pridať sa
									</button>
								{/if}
							{:else}
								<div
									class="flex justify-between items-center bg-opacity-20 p-2 bg-gray-400
							border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-not-allowed"
								>
									<Icon icon="mdi:stop-remove-outline" />
									Nie si učiteľ
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else if loadingFailed}
		<div class="w-full h-12 relative flex items-center justify-center">
			<div class="text-red-500 font-bold text-lg z-10">
				{#if notFound}
					Disciplína nebola nájdená
				{:else}
					Nastala chyba pri načítavaní údajov
				{/if}
			</div>
			<div class="absolute inset-0 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
		</div>
	{:else}
		<div class="w-full h-12 bg-gray-200 dark:bg-slate-600 rounded animate-pulse relative" />
	{/if}
</div>
