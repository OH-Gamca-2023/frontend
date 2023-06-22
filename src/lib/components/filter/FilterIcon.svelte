<script lang="ts">
	export let expanded = false
</script>

<svg width="32" height="18" viewBox="0 0 32 18" class={$$props.class} class:expanded>
	<line id="top" x1="2" y1="2" x2="28" y2="2" />
	<line id="middle" x1="6.5" y1="9" x2="23.5" y2="9" />
	<line id="bottom" x1="11" y1="16" x2="19" y2="16" />
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

	.expanded {
		#top {
			transform: translate(0px, 14px);
		}

		#bottom {
			transform: translate(0px, -14px);
		}
	}
</style>
