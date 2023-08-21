import { derived } from "svelte/store";
import { settings } from "./values";

export const darkTheme = derived(settings, ($settings) => $settings.darkMode.value);