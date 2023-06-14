<script lang="ts">
	import { disciplines } from '$lib/api/models'
	import { darkTheme } from '$lib/data/prefs'
	import type { Discipline } from '$lib/types'
	import Icon from './Icon.svelte'
	import { userState } from '$lib/state'

	export let id: string

	$: discipline = $disciplines[id] as Discipline | undefined

	if (!discipline) disciplines.loadSingle(id)

	let view = 'overview' as 'overview' | 'people' | 'results'

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
				<div class="flex flex-row pt-2 justify-center space-x-2">
					{#if discipline.category}
						<!-- Using if in case something goes wrong, so that the rest
							of the page will still render -->
						<div class="ampule {discipline.category.calendarClass}" class:dark={$darkTheme}>
							<span class="dot" />
							<span class="text-sm font-bold">{discipline.category.name}</span>
						</div>
					{/if}
					{#each discipline.target_grades as grade}
						{#if grade}
							<div class="ampule" class:dark={$darkTheme}>
								<span class="dot" />
								<span class="text-sm font-bold">{grade.name}</span>
							</div>
						{/if}
					{/each}
				</div>
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
											class="flex flex-row bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400
										border-b border-gray-300 dark:border-gray-500"
										>
											<div class="flex flex-col flex-1">
												<div class="flex flex-row justify-between items-center">
													<Icon icon="mdi:account" />
													<span class="text-md">{organiser.first_name} {organiser.last_name}</span>
												</div>
												{#if organiser.email}
													<div class="flex flex-row justify-between items-center">
														<Icon icon="entypo:email" />
														<a
															class="text-md text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400
														"
															href="mailto:{organiser.email}?subject=OH Gamča - {discipline.name}"
															>{organiser.email}</a
														>
													</div>
												{/if}
												{#if organiser.phone_number}
													<div class="flex flex-row justify-between items-center">
														<Icon icon="ph:phone-bold" />
														<a
															class="text-md text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400
														"
															href="tel:{organiser.phone_number}">{organiser.phone_number}</a
														>
													</div>
												{/if}
											</div>
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
											class="flex flex-row bg-opacity-0 hover:bg-opacity-10 p-2 bg-gray-400
										border-b border-gray-300 dark:border-gray-500"
										>
											<div class="flex flex-col flex-1">
												<div class="flex flex-row justify-between items-center">
													<Icon icon="mdi:account" />
													<span class="text-md">{teacher.first_name} {teacher.last_name}</span>
												</div>
												{#if teacher.email}
													<div class="flex flex-row justify-between items-center">
														<Icon icon="entypo:email" />
														<a
															class="text-md text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400
														"
															href="mailto:{teacher.email}?subject=OH Gamča - {discipline.name}"
															>{teacher.email}</a
														>
													</div>
												{/if}
												{#if teacher.phone_number}
													<div class="flex flex-row justify-between items-center">
														<Icon icon="ph:phone-bold" />
														<a
															class="text-md text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
															href="tel:{teacher.phone_number}">{teacher.phone_number}</a
														>
													</div>
												{/if}
											</div>
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

<style lang="scss">
	.ampule {
		height: 1.5rem;
		padding: 5px 8px 5px 5px;
		border-radius: 15rem;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		background: hsl(0, 0%, 84%);
		color: hsl(0, 0%, 31%);

		.dot {
			width: 12px;
			height: 12px;
			margin: 0px 4px 0px 3px;
			border-radius: 50%;

			background: hsl(0, 0%, 13%);
		}

		&.task--warning {
			background: hsl(35, 98%, 90%);
			.dot {
				background: hsl(35, 95%, 53%);
			}
			color: hsl(35, 98%, 40%);
		}

		&.task--danger {
			background: hsl(348, 98%, 90%);
			.dot {
				background: hsl(348, 95%, 53%);
			}
			color: hsl(348, 98%, 40%);
		}

		&.task--info {
			background: hsl(220, 98%, 90%);
			.dot {
				background: hsl(220, 95%, 53%);
			}
			color: hsl(220, 98%, 40%);
		}

		&.task--success {
			background: hsl(120, 70%, 90%);
			.dot {
				background: hsl(120, 70%, 53%);
			}
			color: hsl(120, 70%, 40%);
		}
	}
</style>
