<script lang="ts">
	import IconifyIcon, { type IconifyRenderMode } from '@iconify/svelte'

	export let icon: string

	export let id: string | undefined = undefined
	export let style: string | undefined = undefined

	export let mode: IconifyRenderMode | undefined = undefined
	export let color: string | undefined = undefined
	export let flip: string | undefined = undefined
	export let inline: boolean | undefined = undefined
	export let rotate: number | undefined = undefined
</script>

<IconifyIcon {icon} {id} {style} {mode} {color} {flip} {inline} {rotate} class={$$props.class} />
