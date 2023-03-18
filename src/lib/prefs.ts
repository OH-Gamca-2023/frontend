import { browser } from '$app/environment'
import { derived, type Writable } from 'svelte/store'

interface Prefs {
	theme: 'light' | 'dark'
}

// Default values for preferences
const defaultValues: Prefs = {
	theme: 'dark',
}

// Preferences singleton
const prefs = load()

/**
 * Load preferences from local storage.
 * If invalid JSON is found, the default values are used.
 * Missing keys are filled with the default values.
 * @returns The preferences object
 */
function load(): Prefs {
	const prefs = { ...defaultValues }
	if (!browser) return prefs
	try {
		const storedPrefs = JSON.parse(localStorage.getItem('prefs') ?? '{}')
		Object.assign(prefs, storedPrefs)
	} catch (e) {
		console.error('Failed to load prefs from local storage', e)
	}
	return prefs
}

class PrefWritable<K extends keyof Prefs> implements Writable<Prefs[K]> {
	constructor(private key: K) {}

	private subscribers = new Set<(value: Prefs[K]) => void>()

	subscribe(run: (value: Prefs[K]) => void) {
		this.subscribers.add(run)
		run(prefs[this.key])
		return () => this.subscribers.delete(run)
	}

	set(value: Prefs[K]) {
		prefs[this.key] = value
		save(prefs)
		this.subscribers.forEach((run) => run(value))
	}

	update(fn: (value: Prefs[K]) => Prefs[K]) {
		this.set(fn(prefs[this.key]))
	}
}

const writables = Object.fromEntries(
	Object.keys(prefs).map((key) => {
		return [key, new PrefWritable(key as keyof Prefs)]
	}),
) as { [K in keyof Prefs]: PrefWritable<K> }

/**
 * Save preferences to local storage.
 * @param prefs The preferences object
 */
function save(prefs: Prefs) {
	if (!browser) return
	localStorage.setItem('prefs', JSON.stringify(prefs))
}

export function getPref<K extends keyof Prefs>(key: K): Writable<Prefs[K]> {
	return writables[key]
}

export function getPrefValue<K extends keyof Prefs>(key: K): Prefs[K] {
	return prefs[key]
}

export function setPrefValue<K extends keyof Prefs>(key: K, value: Prefs[K]) {
	writables[key].set(value)
}

// Additional stores if any other logic is needed

export const darkTheme = derived(getPref('theme'), ($theme) => {
	return $theme === 'dark'
})
