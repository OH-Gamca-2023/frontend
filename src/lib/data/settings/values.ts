import { derived, readable, type Writable } from 'svelte/store'
import type { Settings } from './types'
import { browser } from '$app/environment'
import { getApiHost } from '../api'
import { Buffer } from 'buffer'

// Contains default values for settings
const settings: Settings = {
	darkMode: {
		name: 'Tmavý režim',
		description: null,
		userEditable: true,
		type: 'boolean',

		key: 'darkMode',
		value: true,
	},
	debugMode: {
		name: 'Režim ladenia',
		description: 'Zapína režim ladenia, ktorý zobrazuje viac informácií o chybách',
		userEditable: true,
		type: 'boolean',

		key: 'debugMode',
		value: false,
	},
	backupMicrosoftOAuth: {
		name: 'Alternatívne prihlasovanie pre Microsoft',
		description:
			'Ak je zapnuté, použije sa prihlasovací systém na základe presmerovania namiesto štandardného SPA systému. ' +
			'Neodporúča sa používať ale vie pomôcť pri niektorých problémoch s prihlásením.',
		userEditable: false,
		type: 'boolean',

		key: 'backupMicrosoftOAuth',
		value: false,
	},
	requireLogin: {
		name: 'Vyžadovať prihlásenie',
		description: 'Ak je zapnuté, stránka sa dá používať iba po prihlásení',
		userEditable: false,
		type: 'boolean',

		key: 'requireLogin',
		value: false,
	},
}
let updateTrigger: (settings: Settings) => void = () => {
	return
}
let loadSettingsCallback: () => void = () => {
	return
}
const settingsLoaded = new Promise<void>(
	(resolve) =>
		(loadSettingsCallback = () => {
			resolve()
			loadSettingsCallback = () => {
				return
			}
		}),
)

let serverOverrides: { [key: string]: any } = {}

const localOverrides = {
}

function isOverridden(key: string) {
	return key in serverOverrides || key in localOverrides
}

function load(recursive = false) {
	const values = Object.fromEntries(
		Object.entries(settings).map(([key, setting]) => [key, setting.value]),
	)
	if (browser) {
		try {
			const storedValues = JSON.parse(localStorage.getItem('settings') ?? '{}')
			Object.assign(values, storedValues)
		} catch (e) {
			console.error('Failed to load settings from local storage', e)
		}
		loadServerOverrides()
	}

	Object.assign(values, serverOverrides)
	Object.assign(values, localOverrides)
	// assigned in 2 steps to ensure that server overrides are not overridden by local overrides

	if (browser && !recursive) {
		fetch(getApiHost() + '/data/settings/', {
			method: 'GET',
		})
			.then(async (resp) => {
				if (!resp.ok) throw new Error('Failed to fetch settings')
				const data = await resp.json()
				serverOverrides = {}
				for (const obj of data) {
					serverOverrides[obj.key] = obj.value
				}
				saveServerOverrides()
				load(true)
			})
			.catch((e) => {
				console.error('Failed to load settings from server', e)
			})
	}
	for (const [key, value] of Object.entries(values)) {
		settings[key].value = value
	}
	updateTrigger(settings)
	loadSettingsCallback()
}
load()

function saveServerOverrides() {
	// encode in base64 and xor every byte with 0x34
	const encoded = Buffer.from(JSON.stringify(serverOverrides)).toString('base64')
	const encodedXor = Buffer.from(encoded).map((byte) => byte ^ 0x34)
	localStorage.setItem('ssettings', Buffer.from(encodedXor).toString('base64'))
}

function loadServerOverrides() {
	try {
		const encodedXor = localStorage.getItem('ssettings') as string | null
		if (encodedXor) {
			const encoded = Buffer.from(
				Buffer.from(encodedXor, 'base64').map((byte) => byte ^ 0x34),
			).toString()
			const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString())
			serverOverrides = decoded
		}
	} catch (e) {
		console.error('Failed to load server settings', e)
	}
}

function save() {
	if (browser) {
		// get current localStorage settings
		const storedValues = JSON.parse(localStorage.getItem('settings') ?? '{}')
		// only save settings that are not overridden and are user editable
		const values = Object.fromEntries(
			Object.entries(settings)
				.filter(([key, setting]) => setting.userEditable && !isOverridden(key))
				.map(([key, setting]) => [key, setting.value]),
		)
		// merge with stored values
		Object.assign(storedValues, values)
		localStorage.setItem('settings', JSON.stringify(storedValues))
	}
}

function setValue(key: string, value: any) {
	if (key in settings && !isOverridden(key)) {
		settings[key].value = value
		updateTrigger(settings)
	}
}

function setValues(values: { [key: string]: any }) {
	for (const [key, value] of Object.entries(values)) {
		setValue(key, value)
	}
}

function get(key: string) {
	if (key in settings) {
		return settings[key].value
	} else {
		throw new Error('Invalid setting key')
	}
}

function getSettings() {
	return settings
}

const settingsReadable = readable(settings, (set) => {
	updateTrigger = set
	return () => {
		updateTrigger = () => {
			return
		}
	}
})
settingsReadable.subscribe(save)
const settingsArrayReadable = derived(settingsReadable, (settings) => Object.values(settings))
const settingsObjectReadable = derived(settingsReadable, (settings) =>
	Object.fromEntries(Object.entries(settings).map(([key, setting]) => [key, setting.value])),
)
const settingsObjectWritable = {
	subscribe: settingsObjectReadable.subscribe,
	set: setValues,
	update: setValues,
} as Writable<{ [key: string]: any }>

export { settingsReadable as settings }
export { settingsArrayReadable as settingsArray }
export { settingsObjectWritable as settingsObject }
export { load, save, setValue, setValues, get, getSettings, isOverridden, settingsLoaded }
