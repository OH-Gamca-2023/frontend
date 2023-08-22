<script lang="ts">
	import { darkTheme } from '$lib/data/settings'
</script>

<div class="h-52 flex w-full align-middle justify-center fixed -z-20 cf-bg" class:dark={$darkTheme}>
	<img src="/assets/logos/vybuch/nobg_color.svg" alt="Logo" class="-my-16" />
</div>

<div class="h-52" id="spacer" />

<style lang="scss">
	:global(.cf-bg) {
		--color-1: rgb(223, 223, 223);
		--color-2: rgb(247, 247, 247);
		--color-3: 255, 255, 255;
		--color-4: white;

		background-size: 100% 100%, 20px 20px, 20px 20px, 20px 10px;
		background-position: 0px 0px, 0px 0px, 10px 10px, 0px 0px;
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
	}
</style>
