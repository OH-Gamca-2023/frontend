<script lang="ts">
	import sponsors, { type Sponsor } from "$lib/data/sponsors"

    let columns: Sponsor[][] = []
    sponsors.forEach((sponsor, index) => {
        if (index % 2 === 0) {
            columns.push([])
        }
        columns[columns.length - 1].push(sponsor)
    })
</script>

<div class="flex flex-row w-full h-full space-x-10 justify-around flex-1">
    {#each columns as column}
        <div class="flex flex-col justify-around">
            {#each column as sponsor}
                <div class="flex justify-center items-center">
                    <a href={sponsor.url} target="_blank" rel="noopener noreferrer">
                        <img src="/assets/sponsors/{sponsor.logo}" alt={sponsor.name} />
                    </a>
                </div>
            {/each}
        </div>
    {/each}
</div>