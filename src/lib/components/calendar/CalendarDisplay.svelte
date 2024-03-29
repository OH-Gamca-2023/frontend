<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import type { Day, Item } from '$lib/types'
	import clickOutside from '$lib/utils/clickOutside'
	import { darkTheme } from '$lib/data/settings'
	import { compareDates } from '$lib/utils/calendar'
	import CalendarEvent from './CalendarEvent.svelte'
	import { slide } from 'svelte/transition'

	export let days: Day[] = []
	export let items: Item[] = []
	export let usedHeaders: string[] = []
	export let selected: { items: string[]; days: string[] } = { items: [], days: [] }
	export let visible = false

	$: perDayItems = days.map((day) => items.filter((item) => compareDates(item.date, day.date)))

	$: dayPositions = days.map((day) => {
		let dayIndex = days.indexOf(day)
		let row = Math.floor(dayIndex / 7) + 1
		let column = (dayIndex % 7) + 1
		return { row, column }
	})
	$: maxRow = Math.max(...dayPositions.map((pos) => pos.row))

	let dispatch = createEventDispatcher()
</script>

<div class="calendar" use:clickOutside={() => dispatch('clickOutside')} class:dark={$darkTheme}>
	<div class="flex">
		{#each usedHeaders as header}
			<span class="day-name text-red-400" class:dark={$darkTheme}>{header}</span>
		{/each}
	</div>
	<div class="flex flex-wrap">
		{#each days as day, index}
			<button
				class="day"
				disabled={!day.enabled}
				class:day-today={day.today}
				class:day-selected={selected.days.includes(day.id)}
				class:dark={$darkTheme}
				class:row-1={dayPositions[index].row === 1}
				class:row-last={dayPositions[index].row === maxRow}
				class:col-last={dayPositions[index].column === 7}
				style="--column: {dayPositions[index].column}; --row: {dayPositions[index].row};"
				tabindex={visible ? 0 : -1}
				on:click={() => dispatch('dayClick', day)}
			>
				<div class="details-wrapper">
					{#each perDayItems[index] as item}
						{#if selected.items.includes(item.id)}
							<div class="details" transition:slide={{ duration: 600 }}>
								<CalendarEvent {item} />
							</div>
						{/if}
					{/each}
				</div>
				<span class="day-text">{day.name}</span>
				<section class="day-tasks">
					{#each perDayItems[index] as item}
						<button
							on:click={() => dispatch('itemClick', item)}
							class="task {item.className}"
							class:small-text={item.title.length > (perDayItems[index].length > 3 ? 10 : 18)}
							class:task-selected={selected.items.includes(item.id)}
							class:dark={$darkTheme}
							class:cols-2={perDayItems[index].length > 3}
							tabindex={visible ? 0 : -1}
							disabled={!day.enabled}
						>
							{item.title}
							<span class="task-text-cutoff" />
							<div class="task-overlay task-select-overlay">
								{item.title}
							</div>
							<div class="task-overlay task-hover-overlay" />
						</button>
					{/each}
				</section>
			</button>
		{/each}
	</div>
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
			border-color: rgba(255, 255, 255, 0.148);
		}
	}

	.day-name {
		color: #e9a1a7;
		border-bottom: 1px solid rgba(166, 168, 179, 0.12);
		background-color: white;
		display: block;

		&.dark {
			background-color: #374151;
			color: #f36974;
		}
	}

	.day:disabled::after {
		cursor: not-allowed;
		background-color: rgba(152, 160, 166, 0.2);
	}

	.task:disabled {
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
		background-color: #dbe7ff;
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
		display: flex;
		flex-direction: column;
		width: calc(185px * 7);
	}

	.day {
		width: 185px;
		height: 150px;
		flex-basis: 1/7;

		display: flex;
		position: relative;
		justify-content: flex-end;
		cursor: default;
		padding: 14px 20px;
		letter-spacing: 1px;
		font-size: 14px;
		box-sizing: border-box;
		position: relative;

		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;

		border-bottom: 1px solid rgba(166, 168, 179, 0.12);
		border-right: 1px solid rgba(166, 168, 179, 0.12);
		color: #98a0a6;

		&.dark {
			color: #ccd3d8;
			border-color: rgba(255, 255, 255, 0.148);
		}

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

			transition: background-color 0.3s ease;
		}

		.details-wrapper {
			position: absolute;
			left: 0;
			margin: 0 8px;
			right: 0;
			top: 0;
			z-index: 100;

			.details {
				position: absolute;
				left: 0;
				bottom: 0;
				width: 100%;
			}
		}

		&.row-1 {
			.details-wrapper {
				top: unset;
				bottom: -10px;

				.details {
					top: 0;
					bottom: unset;
				}
			}
		}

		&.row-last {
			border-bottom: unset;
		}

		&.col-last {
			border-right: unset;
		}
	}

	.day-name {
		text-transform: uppercase;
		text-align: center;
		line-height: 50px;
		font-weight: 500;

		width: 185px;

		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;

		border-bottom: 1px solid rgba(166, 168, 179, 0.12);

		display: none;
		@media (max-width: 1380px) {
			display: inline;
		}
	}

	.day-tasks {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

		display: flex;
		flex-direction: column;

		flex-wrap: wrap;
		align-items: center;
		overflow: hidden;
		padding: 40px 5px 0 5px;
	}

	.task {
		display: flex;
		border-left-width: 3px;
		padding: 4px 10px;
		border-left-style: solid;
		font-size: 14px;
		font-weight: bold;
		position: relative;
		cursor: pointer;
		z-index: 2;
		border-radius: 15px;

		width: 100%;
		margin: 3px 0;

		white-space: nowrap;
		overflow: hidden;

		&.small-text {
			font-size: 13px;
		}

		&.cols-2 {
			width: calc(50% - 5px);
			font-size: 13px;
			padding-left: 8px;

			&.small-text {
				font-size: 12px;
			}
		}

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
				transition:
					width 0.5s ease-in-out,
					opacity 0.4s ease-in-out;
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
				width: calc(100% + 5px);
				opacity: 1;
				transition:
					width 0.5s ease-in-out,
					opacity 0.4s ease-in-out 0.1s;
			}
		}
	}

	.day:disabled::after,
	.task:disabled::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 5;
	}

	.day:disabled::after {
		cursor: not-allowed;
		background-color: rgba(152, 160, 166, 0.2);
	}

	.task:disabled {
		.task-hover-overlay {
			cursor: not-allowed;
			background-color: rgba(152, 160, 166, 0.4) !important;
			opacity: 1 !important;
		}
	}
</style>
