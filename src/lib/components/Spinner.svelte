<span class="wrapper {$$props.class}">
	<span class="loader border-t-white dark:border-t-black" />
</span>

<style lang="scss">
	.wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loader {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: inline-block;
		border-top: 3px solid;
		border-right: 3px solid transparent;
		box-sizing: border-box;
		animation: rotation 1s linear infinite;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
