/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope

import { dev } from '$app/environment'
import { build, files, version } from '$service-worker'

// Create a cache name from the current version
const CACHE_NAME = `cache-${version}`

// Create a list of all the files we want to cache
const CACHE_FILES = [...build, ...files]

// Install the service worker
sw.addEventListener('install', (event) => {
	if (dev) return
	async function addAll() {
		const cache = await caches.open(CACHE_NAME)
		await cache.addAll(CACHE_FILES)
	}

	event.waitUntil(addAll())

	// Tell the browser to activate this service worker immediately once it has finished installing
	sw.skipWaiting()
})

// Activate the service worker
sw.addEventListener('activate', (event) => {
	if (dev) return
	async function deleteOldCaches() {
		const keys = await caches.keys()
		const oldKeys = keys.filter((key) => key !== CACHE_NAME)
		await Promise.all(oldKeys.map((key) => caches.delete(key)))
	}

	event.waitUntil(deleteOldCaches())
})

// Intercept fetch requests
sw.addEventListener('fetch', (event) => {
	if (dev) return
	// Only handle GET requests
	if (event.request.method !== 'GET') return

	// Ignore requests for /api/* and /admin/*
	if (event.request.url.includes('/api') || event.request.url.includes('/admin')) return

	async function respond() {
		const url = new URL(event.request.url)
		const cache = await caches.open(CACHE_NAME)

		if (CACHE_FILES.includes(url.pathname)) {
			return (await cache.match(url.pathname)) || Response.error()
		}

		try {
			const response = await fetch(event.request)
			if (response.status === 200) {
				cache.put(event.request, response.clone())
			}
			return response
		} catch (error) {
			return (await cache.match(event.request)) || Response.error()
		}
	}

	event.respondWith(respond())
})
