<script lang="ts">
	export let name: string
	export let styleClass = ''
</script>

<div class="ampule {styleClass}">
	<span class="dot" />
	<span class="text-sm font-bold">{name}</span>
</div>

<style lang="scss">
	.ampule {
		height: 1.5rem;
		padding: 5px 8px 5px 5px;
		border-radius: 15rem;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		white-space: nowrap;

		background: hsl(0, 0%, 84%);
		color: hsl(0, 0%, 31%);

		.dot {
			width: 12px;
			height: 12px;
			margin: 0px 4px 0px 3px;
			border-radius: 50%;

			background: hsl(0, 0%, 13%);
		}

		&.task--warning {
			background: hsl(35, 98%, 90%);
			.dot {
				background: hsl(35, 95%, 53%);
			}
			color: hsl(35, 98%, 40%);
		}

		&.task--danger {
			background: hsl(348, 98%, 90%);
			.dot {
				background: hsl(348, 95%, 53%);
			}
			color: hsl(348, 98%, 40%);
		}

		&.task--info {
			background: hsl(220, 98%, 90%);
			.dot {
				background: hsl(220, 95%, 53%);
			}
			color: hsl(220, 98%, 40%);
		}

		&.task--success {
			background: hsl(120, 70%, 90%);
			.dot {
				background: hsl(120, 70%, 53%);
			}
			color: hsl(120, 70%, 40%);
		}
	}
</style>
