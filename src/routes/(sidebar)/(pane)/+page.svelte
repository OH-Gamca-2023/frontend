<script lang="ts">
	import { postList } from '$lib/api/models'
	import Taglist from '$lib/components/tags/Taglist.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import { disciplines as rawDisciplines } from '$lib/api/models'

	$: posts = $postList.slice(0, 5)
	let today = new Date()
	today.setHours(0, 0, 0, 0)
	$: disciplines = Object.values($rawDisciplines)
		.filter((d) => d.date && d.date >= today)
		.sort((a, b) => {
			if (!a.date) return 1
			if (!b.date) return -1
			if (a.date > b.date) return 1
			if (a.date < b.date) return -1
			if (!a.start_time) return 1
			if (!b.start_time) return -1
			return a.start_time.getTime() - b.start_time.getTime()
		})
		.slice(0, 5)
</script>

<svelte:head>
	<title>OH Gamča 2023</title>
</svelte:head>

<div class="flex flex-col gap-5 w-full">
	<div class="flex flex-col w-full border-b border-gray-300 dark:border-gray-500 pb-2 px-4">
		<div class="flex flex-col justify-between items-center w-full">
			<h1 class="text-2xl font-semibold pb-3">Najnovšie príspevky</h1>
		</div>

		{#each posts as post}
			<a
				href="/post/{post.id}"
				class="border-b border-gray-300 dark:border-gray-500 border-dotted flex py-1 w-full flex-row"
			>
				<div class="flex flex-col justify-between flex-1 items-left">
					<h3 class="text-lg font-bold">{post.title}</h3>
					<Taglist {post} />
				</div>
				<div class="flex flex-col items-right text-right gap-1 font-medium text-sm">
					<div class="flex items-center gap-2 justify-end">
						<span>
							{String(post.date.getDate()).padStart(2, '0')}. {String(
								post.date.getMonth() + 1,
							).padStart(2, '0')}.
							{String(post.date.getHours()).padStart(2, '0')}:{String(
								post.date.getMinutes(),
							).padStart(2, '0')}
						</span>
						<Icon icon="formkit:datetime" class="w-4 h-4" />
					</div>
					<div class="flex items-center gap-2 justify-end">
						<span>
							{post.author.username}
						</span>
						<Icon icon="wpf:name" class="w-4 h-4" />
					</div>
				</div>
			</a>
		{:else}
			<div
				class="border-b border-gray-300 dark:border-gray-500 border-dotted flex flex-row py-2 w-full justify-center"
			>
				<p class="text-lg font-medium">Nenašli sa žiadne príspevky</p>
			</div>
		{/each}

		<div class="flex justify-center">
			<a
				href="/news"
				class="text-blue-500 dark:text-blue-400 hover:underline py-2 text-lg font-medium"
				>Všetky príspevky</a
			>
		</div>
	</div>
	<div class="flex flex-col w-full px-4">
		<div class="flex flex-col justify-between items-center w-full">
			<h1 class="text-2xl font-semibold pb-3">Najbližšie disciplíny</h1>
		</div>
		{#each disciplines as discipline}
			<a
				href="/discipline/{discipline.id}"
				class="border-b border-gray-300 dark:border-gray-500 border-dotted flex py-1 w-full flex-row"
			>
				<div class="flex flex-col flex-grow justify-between">
					<h3 class="text-lg font-semibold">{discipline.name}</h3>
					<Taglist {discipline} />
				</div>
				<div class="flex flex-col items-right text-right gap-1 font-medium text-sm">
					{#if discipline.date}
						<div class="flex items-center gap-2 justify-end">
							<span class="text-sm"
								>{String(discipline.date.getDate()).padStart(2, '0')}. {String(
									discipline.date.getMonth() + 1,
								).padStart(2, '0')}. {discipline.date.getFullYear()}</span
							>
							<Icon icon="mdi:calendar" class="w-4 h-4" />
						</div>
					{/if}
					{#if discipline.start_time}
						<div class="flex items-center gap-2 justify-end">
							<span class="text-sm"
								>{#if discipline.end_time}
									{String(discipline.start_time.getHours()).padStart(2, '0')}:{String(
										discipline.start_time.getMinutes(),
									).padStart(2, '0')}&nbsp;-&nbsp;{String(discipline.end_time.getHours()).padStart(
										2,
										'0',
									)}:{String(discipline.end_time.getMinutes()).padStart(2, '0')}
								{:else}
									{String(discipline.start_time.getHours()).padStart(2, '0')}:{String(
										discipline.start_time.getMinutes(),
									).padStart(2, '0')}
								{/if}
							</span>
							<Icon icon="mdi:clock-outline" class="w-4 h-4" />
						</div>
					{/if}
					{#if discipline.location}
						<div class="flex items-center gap-2 justify-end">
							<span class="text-sm">{discipline.location}</span>
							<Icon icon="mdi:map-marker" class="w-4 h-4" />
						</div>
					{/if}
				</div>
			</a>
		{:else}
			<div
				class="border-b border-gray-300 dark:border-gray-500 border-dotted flex flex-row py-2 w-full justify-center"
			>
				<p class="text-lg font-medium">Nenašli sa žiadne disciplíny</p>
			</div>
		{/each}

		<div class="flex justify-center">
			<a
				href="/disciplines"
				class="text-blue-500 dark:text-blue-400 hover:underline py-2 text-lg font-medium"
				>Všetky disciplíny</a
			>
		</div>
	</div>
</div>
