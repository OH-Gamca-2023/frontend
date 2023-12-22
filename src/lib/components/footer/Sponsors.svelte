<script lang="ts">
	import { darkTheme } from '$lib/data/settings'
	import sponsors, { type Sponsor } from '$lib/data/sponsors'

	let columns: Sponsor[][] = []
	sponsors.forEach((sponsor, index) => {
		if (index % 2 === 0) {
			columns.push([])
		}
		columns[columns.length - 1].push(sponsor)
	})
</script>

<div class="flex w-full h-full space-x-10 flex-1 justify-center">
	{#each columns as column}
		<div class="flex flex-col justify-around space-y-5">
			{#each column as sponsor}
				<div class="flex justify-center items-center">
					<a
						href={sponsor.url}
						target="_blank"
						rel="noopener noreferrer"
						id="sponsor"
						class={darkTheme ? 'dark' : ''}
					>
						<img
							src="/assets/sponsors/{$darkTheme ? sponsor.darkLogo : sponsor.logo}"
							alt={sponsor.name}
							class="max-h-14"
						/>
					</a>
				</div>
			{/each}
		</div>
	{/each}
</div>

<style lang="scss">
	#sponsor {
		position: relative;
		--opacity: 1;

		box-shadow: 0 0 20px 25px rgba(var(--color-3), var(--opacity));
		background-color: rgba(var(--color-3), var(--opacity));
		border-radius: 50%;

		&.dark {
			--opacity: 0.9;
		}
	}
</style>
