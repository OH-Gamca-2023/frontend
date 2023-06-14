import { userState } from "$lib/state";
import { get } from "svelte/store";

export function hasPermission(perm: string) {
    const state = get(userState)
    if(!state.loggedIn || !state.user || !state.user.permissions) return false
    return state.user.permissions.permissions.includes(perm)
}