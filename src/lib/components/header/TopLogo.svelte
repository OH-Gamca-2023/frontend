<script lang="ts">
	import { darkTheme } from '$lib/data/settings'
	import Sponsors from '../footer/Sponsors.svelte'
</script>

<div
	class="h-52 flex w-full align-middle justify-between fixed -z-20 pr-5 cf-bg"
	class:dark={$darkTheme}
>
	<div class="flex justify-center flex-grow h-52" id="top-logo-wrap">
		<img src="/assets/logos/vybuch/nobg_color.svg" alt="Logo" class="-my-10" id="top-logo" />
	</div>
	<div class="hidden lmd:block">
		<Sponsors />
	</div>
</div>

<div class="h-52 relative" id="spacer" />

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
		--opacity-modifier: 0.2;
	}

	#top-logo {
		background: radial-gradient(
			circle,
			rgba(var(--color-3), calc(0.7 + var(--opacity-modifier))) 0%,
			rgba(var(--color-3), calc(0.4 + var(--opacity-modifier))) 50%,
			rgba(var(--color-3), 0.1) 65%,
			rgba(var(--color-3), 0) 60%
		);
		background-position: -22px -10px;
		background-repeat: no-repeat;
	}
</style>
