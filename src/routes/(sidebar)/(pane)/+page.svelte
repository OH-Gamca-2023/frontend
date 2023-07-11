<script lang="ts">
	import { postList } from '$lib/api/models'
	import Taglist from '$lib/components/tags/Taglist.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import { disciplines as rawDisciplines } from '$lib/api/models'

	$: posts = $postList.slice(0, 5)
	$: disciplines = Object.values($rawDisciplines)
		.sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0))
		.slice(0, 5)
</script>

<div class="flex flex-col gap-5 w-full">
	<div class="flex flex-col w-full">
		<div class="flex flex-col justify-between items-center w-full">
			<h1 class="text-2xl font-semibold pb-3">Najnovšie príspevky</h1>
		</div>

		{#each posts as post}
			<a
				href="/post/{post.id}"
				class="border-b border-gray-300 dark:border-gray-500 border-dotted flex py-2 w-full flex-row"
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
		{/each}

		{#if posts.length === 0}
			<div
				class="border-b border-gray-300 dark:border-gray-500 border-dotted flex flex-row py-2 w-full justify-center"
			>
				<p class="text-lg font-medium">Nenašli sa žiadne príspevky</p>
			</div>
		{/if}

		<div class="flex justify-center">
			<a
				href="/news"
				class="text-blue-500 dark:text-blue-400 hover:underline py-2 text-lg font-medium"
				>Všetky príspevky</a
			>
		</div>
	</div>
	<div class="flex flex-col w-full">
		<div class="flex flex-col justify-between items-center w-full">
			<h1 class="text-2xl font-semibold pb-3">Najbližšie disciplíny</h1>
		</div>

		{#if disciplines.length === 0}
			<div
				class="border-b border-gray-300 dark:border-gray-500 border-dotted flex flex-row py-2 w-full justify-center"
			>
				<p class="text-lg font-medium">Nenašli sa žiadne disciplíny</p>
			</div>
		{/if}

		<div class="flex justify-center">
			<a
				href="/disciplines"
				class="text-blue-500 dark:text-blue-400 hover:underline py-2 text-lg font-medium"
				>Všetky disciplíny</a
			>
		</div>
	</div>
</div>
