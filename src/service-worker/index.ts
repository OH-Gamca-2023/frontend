/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope

import { build, files, prerendered, version } from '$service-worker'

// Create a cache name from the current version
const CACHE_NAME = `cache-${version}`

// Create a list of all the files we want to cache
const CACHE_FILES = [...build, ...files, ...prerendered.map((page) => `${page}index.html`), '/fallback.html']

const IGNORED_OBJECTS = [
	'robots.txt',
	'service-worker.js',
]

const IGNORED_ROOTS = [
	'/api',
	'/_webhook',
	'/admin',
	'/admin_static',
	'/uploads',
]

// Install the service worker
sw.addEventListener('install', (event) => { 
	async function addAll() {
		const cache = await caches.open(CACHE_NAME)
		await cache.addAll(CACHE_FILES)
	}

	event.waitUntil(addAll())

	// Tell the browser to activate this service worker immediately once it has finished installing
	sw.skipWaiting()
})

sw.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		const keys = await caches.keys()
		const oldKeys = keys.filter((key) => key !== CACHE_NAME)
		await Promise.all(oldKeys.map((key) => caches.delete(key)))
	}

	event.waitUntil(deleteOldCaches())
})

sw.addEventListener('fetch', (event) => {
	// Ignore requests which are not GET
	if(event.request.method !== 'GET') return

	const url = new URL(event.request.url)

	// Ignore requests with path starting with something in IGNORED_ROOTS
	if(IGNORED_ROOTS.some((path) => url.pathname.startsWith(path))) return
	// Ignore requests with path including something in IGNORED_OBJECTS
	if(IGNORED_OBJECTS.some((path) => url.pathname.includes(path))) return
	// Ignore requests with query string
	if(url.search) return

	if(prerendered.includes(url.pathname)) {
		event.respondWith((async () => {
			const cache = await caches.open(CACHE_NAME)
			const response = await cache.match(`${url.pathname}index.html`)
			if(response) return response
			return (await caches.match('/fallback.html')) || Response.error()
		})())
	} else if(event.type === 'navigate') {
		event.respondWith((async () => {
			const cache = await caches.open(CACHE_NAME)
			const response = await cache.match('/fallback.html')
			if(response) return response
			return Response.error()
		})())
	} else {
		event.respondWith((async () => {
			// attempt to get the cached response, otherwise fallback to the network
			const cache = await caches.open(CACHE_NAME)
			const response = await cache.match(event.request)
			if(response) return response
			return fetch(event.request)
		})())
	}
})
