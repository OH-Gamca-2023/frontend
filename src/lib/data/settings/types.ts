export type SettingProps = {
	name: string
	description: string | null
	userEditable: boolean
	type: SettingValueType
}

export type SettingValueType = 'boolean' | 'string' | 'number'

export type SettingValue<T> = {
	key: string
	value: T
}

export type Setting<T> = SettingProps & SettingValue<T>

export interface GenericSettings {
	[key: string]: Setting<any>
}

export interface Settings extends GenericSettings {
	darkMode: Setting<boolean>
	debugMode: Setting<boolean>
	backupMicrosoftOAuth: Setting<boolean>
	requireLogin: Setting<boolean>
}
