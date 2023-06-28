<script lang="ts">
	import type { PageData } from './$types'
	import 'prismjs/themes/prism.min.css'
	import '../../../../../markdown.css'

	import { disciplines } from '$lib/api/models'
	import type { Discipline } from '$lib/types'
	import Icon from '$lib/components/Icon.svelte'
	import { userState } from '$lib/state'
	import Taglist from '$lib/components/tags/Taglist.svelte'
	import Person from '$lib/components/Person.svelte'
	import { modifyPrimaryOrganisers, modifyTeacherSupervisors } from '$lib/api'
	import { toast } from '$lib/utils/toasts'

	export let data: PageData

	$: discipline = $disciplines[data.disciplineId] as Discipline | undefined

	if (!discipline) disciplines.loadSingle(data.disciplineId)

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
</script>

<div class="w-full flex flex-col">
	{#if discipline}
		<div class="flex flex-row justify-center items-center pb-5">
			<div class="flex flex-col justify-center items-center">
				<span class="text-3xl font-bold pb-1">{discipline.name}</span>
				<Taglist {discipline} class="justify-center" />
			</div>
		</div>
		<div class="flex flex-col space-y-5 2xl:space-y-0 2xl:flex-row flex-wrap pt-5">
			<div class="flex flex-col basis-1/2 2xl:basis-1/5 2xl:mr-5">
				<span class="text-xl font-bold">Základné informácie</span>
				<div class="flex flex-col space-y-1 pt-1">
					{#if discipline.date}
						<div class="flex flex-row space-x-1">
							<Icon icon="mdi:calendar" />
							<span class="text-sm"
								>{String(discipline.date.getDate()).padStart(2, '0')}. {String(
									discipline.date.getMonth() + 1,
								).padStart(2, '0')}. {discipline.date.getFullYear()}</span
							>
						</div>
					{/if}
					{#if discipline.time}
						<div class="flex flex-row space-x-1">
							<Icon icon="mdi:clock-outline" />
							<span class="text-sm"
								>{String(discipline.time.getHours()).padStart(2, '0')}:{String(
									discipline.time.getMinutes(),
								).padStart(2, '0')}</span
							>
						</div>
					{/if}
					{#if discipline.location}
						<div class="flex flex-row space-x-1">
							<Icon icon="mdi:map-marker" />
							<span class="text-sm">{discipline.location}</span>
						</div>
					{/if}
				</div>
			</div>
			<div class="flex flex-col flex-1">
				<span class="text-xl font-bold">Detaily</span>
				{#if discipline.details_published}
					{#if discipline.details.length > 0}
						{discipline.details}
					{:else}
						<div class="text-red-500 text-lg font-bold">Nastala chyba pri spracúvaní údajov</div>
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
											class="bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400 border-b border-gray-300 dark:border-gray-500 flex flex-row"
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
									class="flex flex-row justify-between items-center bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500"
								>
									<Icon icon="octicon:x-12" />
									<span class="text-md">Zatiaľ nikto</span>
								</div>
							{/if}

							{#if $userState.user.clazz.grade.is_organiser}
								{#if primary_loading}
									<div
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
						border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
									>
										<Icon icon="mdi:loading" class="w-6 h-6 animate-spin" />
										Spracúvam...
									</div>
								{:else if is_primary}
									<button
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
										on:click={primary_click}
									>
										<Icon icon="octicon:x-12" class="w-6 h-6" />
										Odhlásiť sa
									</button>
								{:else}
									<button
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
										on:click={primary_click}
									>
										<Icon icon="typcn:plus" class="w-6 h-6" />
										Pridať sa
									</button>
								{/if}
							{:else}
								<div
									class="flex flex-row justify-between items-center bg-opacity-20 p-2 bg-gray-400
							border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-not-allowed"
								>
									<Icon icon="mdi:stop-remove-outline" />
									Nie si organizátor
								</div>
							{/if}
						</div>
					</div>
					<div class="flex flex-col pt-4">
						<span class="text-xl font-bold">Učiteľský dozor</span>
						<div
							class="flex flex-col rounded-md border border-b-0 border-gray-300 dark:border-gray-500 mt-5"
						>
							{#if discipline.teacher_supervisors && discipline.teacher_supervisors.length > 0}
								{#each discipline.teacher_supervisors as teacher}
									{#if teacher}
										<div
											class="bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400 border-b border-gray-300 dark:border-gray-500 flex flex-row"
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
									class="flex flex-row justify-between items-center bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500"
								>
									<Icon icon="octicon:x-12" />
									<span class="text-md">Zatiaľ nikto</span>
								</div>
							{/if}

							{#if $userState.user.clazz.grade.is_teacher}
								{#if supervisor_loading}
									<div
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
						border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
									>
										<Icon icon="mdi:loading" class="w-6 h-6 animate-spin" />
										Spracúvam...
									</div>
								{:else if is_supervisor}
									<button
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
										on:click={supervisor_click}
									>
										<Icon icon="octicon:x-12" />
										Odhlásiť sa
									</button>
								{:else}
									<button
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
										on:click={supervisor_click}
									>
										<Icon icon="typcn:plus" />
										Pridať sa
									</button>
								{/if}
							{:else}
								<div
									class="flex flex-row justify-between items-center bg-opacity-20 p-2 bg-gray-400
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
	{:else}
		<div class="w-full h-12 bg-gray-200 dark:bg-slate-600 rounded animate-pulse relative" />
	{/if}
</div>
