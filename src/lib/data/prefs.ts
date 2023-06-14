import { browser } from '$app/environment'
import { derived, type Writable } from 'svelte/store'
import { devMode } from './settings'

interface Prefs {
	theme: 'light' | 'dark'
	devMode: boolean
}

// Default values for preferences
const defaultValues: Prefs = {
	theme: 'dark',
	devMode: devMode.default,
}

// Preferences singleton
const prefValues = load()

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
	if(devMode.force !== null) prefs.devMode = devMode.force
	return prefs
}

class PrefWritable<K extends keyof Prefs> implements Writable<Prefs[K]> {
	constructor(private key: K) {}

	private subscribers = new Set<(value: Prefs[K]) => void>()

	subscribe(run: (value: Prefs[K]) => void) {
		this.subscribers.add(run)
		run(prefValues[this.key])
		return () => this.subscribers.delete(run)
	}

	set(value: Prefs[K]) {
		prefValues[this.key] = value
		save(prefValues)
		this.subscribers.forEach((run) => run(value))
	}

	update(fn: (value: Prefs[K]) => Prefs[K]) {
		this.set(fn(prefValues[this.key]))
	}
}

const writables = Object.fromEntries(
	Object.keys(prefValues).map((key) => {
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

export function getPrefValue<K extends keyof Prefs>(key: K): Prefs[K] {
	return prefValues[key]
}

export function setPrefValue<K extends keyof Prefs>(key: K, value: Prefs[K]) {
	writables[key].set(value)
}

export const prefs = derived(Object.values(writables), (values) => {
	return Object.fromEntries(
		Object.keys(writables).map((key, i) => {
			return [key, values[i]]
		}),
	) as any as Prefs
})

// Additional stores if any other logic is needed

export const darkTheme = derived(writables.theme, ($theme) => {
	return $theme === 'dark'
})
