<script lang="ts">
	import sponsors, { type Sponsor } from '$lib/data/sponsors'

	let columns: Sponsor[][] = []
	sponsors.forEach((sponsor, index) => {
		if (index % 2 === 0) {
			columns.push([])
		}
		columns[columns.length - 1].push(sponsor)
	})
</script>

<div class="flex flex-row w-full h-full space-x-10 flex-1 justify-center">
	{#each columns as column}
		<div class="flex flex-col justify-around space-y-5">
			{#each column as sponsor}
				<div class="flex justify-center items-center">
					<a href={sponsor.url} target="_blank" rel="noopener noreferrer">
						<img src="/assets/sponsors/{sponsor.logo}" alt={sponsor.name} class="max-h-14" />
					</a>
				</div>
			{/each}
		</div>
	{/each}
</div>
