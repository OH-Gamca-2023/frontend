import { readable } from 'svelte/store'

/**
 * A readable store that updates every second with the current time.
 */
export const seconds = readable(new Date(), (set) => {
	const update = () => set(new Date())
	const interval = setInterval(update, 1000)
	return () => clearInterval(interval)
})

/**
 * A readable store that updates every minute with the current time.
 */
export const minutes = readable(new Date(), (set) => {
	const update = () => set(new Date())
	const interval = setInterval(update, 60 * 1000)
	return () => clearInterval(interval)
})

/**
 * A readable store that updates in sub-second intervals with the current time.
 */
export const subSeconds = readable(new Date(), (set) => {
	const update = () => set(new Date())
	const interval = setInterval(update, 80)
	return () => clearInterval(interval)
})
