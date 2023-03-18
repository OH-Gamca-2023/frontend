<script lang="ts">
	export let open: boolean = false
</script>

<svg width="32" height="24" viewBox="0 0 32 24" class={$$props.class} class:open>
	<line id="top" x1="0" y1="2" x2="32" y2="2" />
	<line id="middle" x1="0" y1="12" x2="24" y2="12" />
	<line id="bottom" x1="0" y1="22" x2="32" y2="22" />
</svg>

<style lang="scss">
	svg {
		min-height: 24px;
		transition: transform 0.3s ease-in-out;

		line {
			stroke: currentColor;
			stroke-width: 3;
			stroke-linecap: round;
			transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
		}
	}

	.open {
		#top {
			transform: translate(6px, 0px) rotate(45deg);
		}

		#middle {
			opacity: 0;
		}

		#bottom {
			transform: translate(-12px, 9px) rotate(-45deg);
		}
	}
</style>
