<script lang="ts">
	import type { PageData } from './$types'
	import 'prismjs/themes/prism.min.css'
	import '../../../../../markdown.css'

	import { disciplines } from '$lib/api/models'
	import type { Discipline } from '$lib/types'
	import Icon from '$lib/components/Icon.svelte'
	import { userState } from '$lib/state'
	import Taglist from '$lib/components/posts/tags/Taglist.svelte'
	import Person from '$lib/components/Person.svelte'

	export let data: PageData

	$: discipline = $disciplines[data.disciplineId] as Discipline | undefined

	if (!discipline) disciplines.loadSingle(data.disciplineId)

	$: is_primary =
		discipline?.primary_organisers?.map((e) => e.id).includes($userState.user?.id) ?? false
	$: is_supervisor =
		discipline?.teacher_supervisors?.map((e) => e.id).includes($userState.user?.id) ?? false
</script>

<div class="w-full flex flex-col">
	{#if discipline}
		<div class="flex flex-row justify-center items-center">
			<div class="flex flex-col justify-center items-center">
				<span class="text-3xl font-bold">{discipline.name}</span>
				<Taglist {discipline} />
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
								{#if is_primary}
									<div
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
									>
										<Icon icon="octicon:x-12" />
										Odhlásiť sa
									</div>
								{:else}
									<div
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
									>
										<Icon icon="typcn:plus" />
										Pridať sa
									</div>
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
								{#if is_supervisor}
									<div
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
									>
										<Icon icon="octicon:x-12" />
										Odhlásiť sa
									</div>
								{:else}
									<div
										class="flex flex-row justify-between items-center bg-opacity-20 hover:bg-opacity-50 p-2 bg-gray-400
								border-b border-gray-300 dark:border-gray-500 rounded-b-md cursor-pointer"
									>
										<Icon icon="typcn:plus" />
										Pridať sa
									</div>
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
