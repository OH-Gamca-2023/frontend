import { browser } from '$app/environment'
import { userState } from '$lib/state';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types'

export const load = (() => {

    if(get(userState).loggedIn) {
        throw redirect(302, '/');
    }

    const urlParams = browser ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const params = Object.fromEntries(urlParams.entries());
    if(browser) window.history.replaceState({}, document.title, window.location.pathname);

    return {
        status: params.status || 'none',
        params
    }
}) satisfies PageLoad