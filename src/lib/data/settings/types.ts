export type SettingProps = {
    name: string;
    description: string;
    userEditable: boolean;
}

export type SettingValueType = boolean | string | number | null;

export type SettingValue<T extends SettingValueType> = {
    key: string;
    value: T;
}

export type Setting<T extends SettingValueType> = SettingProps & SettingValue<T>

export interface GenericSettings {
    [key: string]: Setting<any>;
}

export interface Settings extends GenericSettings {
    darkMode: Setting<boolean>;
    debugMode: Setting<boolean>;
    requireLogin: Setting<boolean>;
}