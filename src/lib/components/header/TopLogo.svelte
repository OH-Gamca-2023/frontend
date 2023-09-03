<script lang="ts">
	import { darkTheme } from '$lib/data/settings'
</script>

<div class="h-52 flex w-full fixed -z-20 cf-bg overflow-hidden" class:dark={$darkTheme}>
	<div class="rounded-full overflow-hidden h-44 w-44 m-4 bg-[#f8e6f0]">
		<img src="/assets/logos/vybuch/bg_color.svg" alt="Logo" class="pt-3 pl-5" />
	</div>
	<img
		src="/assets/logos/vybuch/nobg_color.svg"
		alt="Logo"
		class="absolute w-screen -top-[250px] -z-10"
	/>
</div>

<div class="h-52" id="spacer" />

<style lang="scss">
	:global(.cf-bg) {
		--color-1: rgb(223, 223, 223);
		--color-2: rgb(247, 247, 247);
		--color-3: 255, 255, 255;
		--color-4: white;
		--opacity-modifier: 0.1;

		background-size:
			100% 100%,
			20px 20px,
			20px 20px,
			20px 10px;
		background-position:
			0px 0px,
			0px 0px,
			10px 10px,
			0px 0px;
		background-color: var(--color-1);
		background-image: linear-gradient(
				to right,
				rgba(var(--color-3), 1),
				rgba(var(--color-3), 0) 20%,
				rgba(var(--color-3), 0) 80%,
				rgba(var(--color-3), 1)
			),
			linear-gradient(
				45deg,
				var(--color-4) 25%,
				transparent 25%,
				transparent 75%,
				var(--color-4) 75%,
				var(--color-4)
			),
			linear-gradient(
				45deg,
				var(--color-4) 25%,
				transparent 25%,
				transparent 75%,
				var(--color-4) 75%,
				var(--color-4)
			),
			linear-gradient(to bottom, var(--color-2), var(--color-1));
	}

	:global(.cf-bg.dark) {
		--color-1: rgb(32, 32, 32);
		--color-2: rgb(8, 8, 8);
		--color-3: 0, 0, 0;
		--color-4: black;
		--opacity-modifier: 0;
	}
</style>
