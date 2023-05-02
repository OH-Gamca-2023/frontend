<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import type { Day, Item } from './types'
	import clickOutside from '$lib/utils/clickOutside'
	import { darkTheme } from '$lib/data/prefs'

	export let days: Day[] = []
	export let items: Item[] = []
	export let usedHeaders: string[] = []

	let dispatch = createEventDispatcher()
</script>

<div
	class="calendar rounded-b-lg"
	use:clickOutside={() => dispatch('clickOutside')}
	class:dark={$darkTheme}
>
	{#each usedHeaders as header}
		<span class="day-name" class:dark={$darkTheme}>{header}</span>
	{/each}
	{#each days as day}
		<span
			class="day"
			class:day-disabled={!day.enabled}
			class:day-today={day.today}
			class:day-selected={day.selected}
			class:dark={$darkTheme}
			on:click={() => dispatch('dayClick', day)}
			on:keypress={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch('dayClick', day)}
		>
			<span class="day-text">{day.name}</span>
		</span>
	{/each}

	{#each items as item}
		<section
			on:click={() => dispatch('itemClick', item)}
			on:keypress={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch('itemClick', item)}
			class="task {item.className}"
			class:task-selected={item.selected}
			class:task-disabled={!item.enabled}
			class:dark={$darkTheme}
			style="--column: {item.startCol};      
                    --row: {item.startRow};  
                    align-self: {item.isBottom ? 'end' : 'center'};"
		>
			{item.title}
			<div class="task-overlay task-select-overlay">
				{item.title}
			</div>
			<div class="task-overlay task-hover-overlay" />
		</section>
	{/each}
</div>

<style lang="scss">
	.day {
		border-bottom: 1px solid rgba(166, 168, 179, 0.12);
		border-right: 1px solid rgba(166, 168, 179, 0.12);
		color: #98a0a6;
		background-color: white;

		&.dark {
			color: #ccd3d8;
			background-color: #374151;
		}
	}

	.day-name {
		color: #e9a1a7;
		border-bottom: 1px solid rgba(166, 168, 179, 0.12);
		background-color: white;
		display: none;

		&.dark {
			background-color: #374151;
			color: #f36974;
		}

		@media (max-width: 1340px) {
			display: block;
		}
	}

	.day-disabled {
		&::after {
			cursor: not-allowed;
			background-color: rgba(152, 160, 166, 0.2);
		}
	}

	.task.task-disabled {
		.task-hover-overlay {
			cursor: not-allowed;
			background-color: rgba(152, 160, 166, 0.4) !important;
			opacity: 1 !important;
		}
	}

	.day-today {
		color: #767c81;

		&.dark {
			color: #ebe9e9;
		}

		&::before {
			background-color: rgba(255, 200, 0, 0.572);
		}
	}

	.day-selected {
		&::before {
			background-color: rgba(136, 255, 0, 0.123);
		}

		&.day-today {
			&::before {
				background-color: rgba(255, 200, 0, 0.706);
			}
		}
	}

	.task--warning {
		border-left-color: #fdb44d;
		background: #fef0db;
		color: #fc9b10;

		.task-select-overlay {
			background-color: #fc9b10 !important;
			border-left-color: #ffc97d !important;
			color: #fef0db !important;
		}

		.task-hover-overlay {
			background-color: rgba(252, 155, 16, 0.1) !important;
		}
	}

	.task--danger {
		border-left-color: #fa607e;
		background: #ffd4dd;
		color: #f8254e;

		.task-select-overlay {
			background-color: #f8254e !important;
			border-left-color: #ff839c !important;
			color: #ffd4dd !important;
		}

		.task-hover-overlay {
			background-color: rgba(248, 37, 78, 0.1) !important;
		}
	}

	.task--info {
		border-left-color: #4786ff;
		background: #dbe7ff;
		color: #0a5eff;

		.task-select-overlay {
			background-color: #0a5eff !important;
			border-left-color: #7ab2ff !important;
			color: #dbe7ff !important;
		}

		.task-hover-overlay {
			background-color: rgba(10, 94, 255, 0.1) !important;
		}
	}

	.task--success {
		border-left-color: #5cb85c;
		background: #ccffcc;
		color: #3c763d;

		.task-select-overlay {
			background-color: #259c27 !important;
			border-left-color: #ccffcc !important;
			color: #bbffbb !important;
		}

		.task-hover-overlay {
			background-color: rgba(60, 118, 61, 0.1) !important;
		}
	}

	// Below are positioning styles for the calendar

	.calendar {
		display: grid;
		width: 100%;
		grid-template-columns: repeat(7, minmax(120px, 1fr));
		grid-auto-rows: 120px;
		grid-template-rows: 0;
		overflow-x: overlay;

		@media (max-width: 1340px) {
			grid-template-rows: 50px;
		}
	}

	.day {
		text-align: right;
		padding: 14px 20px;
		letter-spacing: 1px;
		font-size: 14px;
		box-sizing: border-box;
		position: relative;

		.day-text {
			z-index: 1;
			position: relative;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 0;
		}

		&:nth-of-type(7n + 7) {
			border-right: 0;
		}

		&:nth-of-type(n + 1):nth-of-type(-n + 7) {
			grid-row: 1;
		}

		&:nth-of-type(n + 8):nth-of-type(-n + 14) {
			grid-row: 2;
		}

		&:nth-of-type(n + 15):nth-of-type(-n + 21) {
			grid-row: 3;
		}

		&:nth-of-type(n + 22):nth-of-type(-n + 28) {
			grid-row: 4;
		}

		&:nth-of-type(n + 29):nth-of-type(-n + 35) {
			grid-row: 5;
		}

		&:nth-of-type(n + 36):nth-of-type(-n + 42) {
			grid-row: 6;
		}

		&:nth-of-type(n + 43):nth-of-type(-n + 49) {
			grid-row: 7;
		}

		&:nth-of-type(7n + 1) {
			grid-column: 1/1;
		}

		&:nth-of-type(7n + 2) {
			grid-column: 2/2;
		}

		&:nth-of-type(7n + 3) {
			grid-column: 3/3;
		}

		&:nth-of-type(7n + 4) {
			grid-column: 4/4;
		}

		&:nth-of-type(7n + 5) {
			grid-column: 5/5;
		}

		&:nth-of-type(7n + 6) {
			grid-column: 6/6;
		}

		&:nth-of-type(7n + 7) {
			grid-column: 7/7;
		}
	}

	.day-name {
		font-size: 12px;
		text-transform: uppercase;
		color: #e9a1a7;
		text-align: center;
		border-bottom: 1px solid rgba(166, 168, 179, 0.12);
		line-height: 50px;
		font-weight: 500;
	}

	.task {
		border-left-width: 3px;
		padding: 8px 12px;
		margin: 10px;
		border-left-style: solid;
		font-size: 14px;
		font-weight: bold;
		position: relative;
		cursor: pointer;
		align-self: center;
		z-index: 2;
		border-radius: 15px;
		margin-top: 15px;

		grid-column: var(--column);
		grid-row: calc(var(--row) + 1);

		.task-overlay {
			all: inherit;
			position: absolute;
			top: 0;
			bottom: 0;
			right: 0px;
			left: -3px;
			margin: 0;
			overflow: hidden;

			&.task-hover-overlay {
				width: calc(100% + 5px);
				opacity: 0;
				transition: opacity 0.2s ease-in-out;
				border-left: unset;
			}

			&.task-select-overlay {
				width: 0;
				opacity: 0;
				transition: width 0.5s ease-in-out, opacity 0.4s ease-in-out;
			}
		}

		&:hover:not(.task-selected) {
			.task-hover-overlay {
				opacity: 1;
			}
		}

		&.task-selected {
			.task-hover-overlay {
				transition: opacity 0.5s ease-in-out;
			}

			.task-select-overlay {
				width: calc(100% + 3px);
				opacity: 1;
				transition: width 0.5s ease-in-out, opacity 0.4s ease-in-out 0.1s;
			}
		}
	}

	.day-disabled,
	.task-disabled {
		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 5;
		}
	}
</style>
