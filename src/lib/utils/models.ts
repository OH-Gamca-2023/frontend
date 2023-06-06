import { getApiHost } from '$lib/api/data'
import { browser } from '$app/environment'
import { addReconnectListener } from '../connection'
import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'
import { getAccessToken } from '$lib/state/token'

export type ModelParser<T> = (data: unknown) => T
export type ModelType = 'list' | 'partial' | 'single'
// 'list' - there are multiple data items, each with an id
// 'partial' - like 'list', but the data present is only a subset of the total data
// 			 - partial models are assumed to be paginated
// 'single' - there is a single data item, with id 0

export class LoadableModel<T> implements Readable<{ [key: string]: T & { fromServer: boolean } }> {
	public isLoaded = false

	private loadRan = false
	private loadingPromise: Promise<void> | undefined = undefined
	private resolveLoadingPromise: (() => void) | undefined = undefined

	public isCached = false

	protected loadListeners: (() => void)[] = []
	protected loadErrorListeners: (() => void)[] = []
	protected subscribers: Subscriber<{ [key: string]: T & { fromServer: boolean } }>[] = []

	protected data: Map<string, T & { fromServer: boolean }> = new Map()

	constructor(
		protected apiUrl: string,
		protected parser: ModelParser<T>,
		protected cache = false,
		protected dependencies: LoadableModel<any>[] = [],
		protected type: ModelType = 'list',
		protected auth = false,
		protected mutable = false,
	) {
		if (!browser) return
		if (cache && !dependencies.every((dep) => dep.cache)) {
			throw new Error('Cache can only be used on models with all dependencies cached')
		}

		this.isCached = cache && localStorage.getItem('cache_' + this.apiUrl) !== null

		this.loadingPromise = new Promise((resolve) => (this.resolveLoadingPromise = resolve))

		if (cache && this.isCached) {
			if (dependencies.length > 0) {
				if (dependencies.every((dep) => dep.isLoaded)) {
					console.debug(
						`[model ${this.apiUrl}] all dependencies loaded or cached, loading from cache`,
					)

					// If loading from cache succeeds, force parameter will be true (meaning load listeners will not be triggered)
					this.load(this.loadFromCache())
				} else {
					console.debug(
						`[model ${this.apiUrl}] some dependencies not loaded or cached, waiting for dependencies`,
					)
					;(async () => {
						await Promise.all(dependencies.map((dep) => dep.load()))
						console.debug(`[model ${this.apiUrl}] all dependencies loaded, loading from cache`)
						this.load(this.loadFromCache())
					})()
				}
			} else {
				console.debug(`[model ${this.apiUrl}] loading from cache`)
				this.load(this.loadFromCache())
			}
		} else if (dependencies.length > 0) {
			console.debug(`[model ${this.apiUrl}] waiting for dependencies`)
			;(async () => {
				await Promise.all(dependencies.map((dep) => dep.load()))
				console.debug(`[model ${this.apiUrl}] all dependencies loaded, loading`)
				await this.load()
			})()
		} else {
			console.debug(`[model ${this.apiUrl}] loading`)
			this.load()
		}

		addReconnectListener(() => {
			// Attempt to reload the model when the connection is re-established
			console.debug(`[model ${this.apiUrl}] connection re-established, updating`)
			this.load(true)
		})
	}

	/**
	 * Attempts to load the model from the cache
	 */
	private loadFromCache(): boolean {
		if (!browser) return false
		try {
			const data = JSON.parse(localStorage.getItem('cache_' + this.apiUrl)!)

			if (this.type !== 'partial') this.data.clear()
			if (this.type === 'list' || this.type === 'partial') {
				for (const item of data) {
					this.data.set(item.id.toString(), { ...this.parser(item), fromServer: false })
				}
			} else this.data.set('0', { ...this.parser(data), fromServer: false })

			this.triggerLoaded()
			console.debug(`[model ${this.apiUrl}] loaded from cache`)
			return true
		} catch (e) {
			console.debug(`[model ${this.apiUrl}] error loading from cache\n`, e)
			return false
		}
	}

	/**
	 * Loads the model from the API
	 * @param force If true, the model will be reloaded even if it is already loaded and no listeners will be triggered
	 */
	public async load(force = false): Promise<void> {
		if (!browser) return
		if (this.loadRan && !force) {
			return this.loadingPromise
		} else {
			this.loadRan = true
		}

		const error = (e: any) => {
			if (!force) {
				this.triggerLoadError()

				if (e) console.error(e)
				throw new Error('Error loading data for model ' + this.apiUrl)
			} else {
				console.debug(`[model ${this.apiUrl}] suppressing load error`)
				return
			}
		}
		let respData: unknown
		try {
			let url = this.apiUrl

			if (!url.startsWith('/')) url = '/' + url
			if (!url.endsWith('/') && !url.includes('.')) url += '/'

			let headers = {}
			if (this.auth && getAccessToken()) {
				headers = {
					'Authorization': 'Bearer ' + getAccessToken(),
				}
			}

			const response = await fetch(getApiHost() + url, { method: 'GET', headers })

			if (response.status)
				if (response.ok) {
					let data = await response.json()
					respData = data

					if (this.type !== 'partial') this.data.clear()
					else respData = respData.results
					if (this.type === 'list' || this.type === 'partial') {
						if (this.type === 'partial') data = data.results
						for (const item of data) {
							this.data.set(item.id.toString(), { ...this.parser(item), fromServer: true })
						}
					} else this.data.set('0', { ...this.parser(data), fromServer: true })
				} else {
					error(undefined)
					return
				}
		} catch (e) {
			error(e)
			return
		}

		this.isLoaded = true
		if (!force) this.triggerLoaded()
		else this.triggerUpdated()
		console.debug(`[model ${this.apiUrl}] loaded from API`)

		this.saveToCache(respData)
	}

	protected saveToCache(respData: any) {
		if (!browser) return
		if (!this.cache) return

		if (this.type == 'single') {
			localStorage.setItem('cache_' + this.apiUrl, JSON.stringify(respData))
			console.debug(`[model ${this.apiUrl}] (single) saved to cache`)
			return
		}

		try {
			if (!Array.isArray(respData)) respData = [respData]

			const currentCache = localStorage.getItem('cache_' + this.apiUrl)
			if (currentCache) {
				const currentCacheData = JSON.parse(currentCache)
				const currentKeys = currentCacheData.map((i: any) => i.id)
				if (this.type === 'list' || this.type === 'partial') {
					for (const item of respData) {
						if (currentKeys.includes(item.id)) {
							Object.assign(currentCacheData[currentKeys.indexOf(item.id)], item)
						} else {
							currentCacheData.push(item)
						}
					}
				} else {
					Object.assign(currentCacheData, respData)
				}
				localStorage.setItem('cache_' + this.apiUrl, JSON.stringify(currentCacheData))
			} else {
				localStorage.setItem(
					'cache_' + this.apiUrl,
					JSON.stringify(Array.isArray(respData) ? respData : [respData]),
				)
			}
			console.debug(`[model ${this.apiUrl}] saved to cache`)
		} catch (e) {
			console.debug(`[model ${this.apiUrl}] error saving to cache\n`, e)
			// Cache is probably corrupted, clear it. Will be automatically regenerated on next load
			console.debug(`[model ${this.apiUrl}] clearing cache`)
			localStorage.removeItem('cache_' + this.apiUrl)
		}
	}

	public get(id: string | number): T | undefined {
		if (this.type === 'single') id = '0'
		return this.data.get(id.toString())
	}

	public getAll(): { [key: string]: T } {
		return Object.fromEntries(this.data)
	}

	public set(id: string | number, value: T, fromServer = false) {
		if(!this.mutable) throw new Error('Model is not mutable')
		if (this.type === 'single') id = '0'
		this.data.set(id.toString(), { ...value, fromServer })
		this.triggerUpdated()
	}

	public get size(): number {
		return this.data.size
	}

	public onLoaded(listener: () => void) {
		this.loadListeners.push(listener)
		if (this.isLoaded) {
			listener()
		}
	}

	public onLoadError(listener: () => void) {
		this.loadErrorListeners.push(listener)
	}

	public subscribe(
		run: Subscriber<{ [key: string]: T }>,
		invalidate?: ((value?: { [key: string]: T } | undefined) => void) | undefined,
	): Unsubscriber {
		this.subscribers.push(run)
		run(this.getAll())

		return () => {
			const index = this.subscribers.indexOf(run)
			if (index > -1) this.subscribers.splice(index, 1)
			invalidate?.(this.getAll())
		}
	}

	public triggerLoadError() {
		this.loadErrorListeners.forEach((listener) => listener())
	}

	public triggerLoaded() {
		this.isLoaded = true
		this.loadListeners.forEach((listener) => listener())

		if (this.resolveLoadingPromise) {
			this.resolveLoadingPromise()
		}

		this.triggerUpdated()
	}

	public triggerUpdated() {
		this.subscribers.forEach((subscriber) => subscriber(this.getAll()))
	}

	public async reload() {
		this.load(true)
	}
}

export class PartialModel<T> extends LoadableModel<T> {
	constructor(
		protected apiUrl: string,
		protected parser: ModelParser<T>,
		protected cache = false,
		protected dependencies: LoadableModel<any>[] = [],
	) {
		super(apiUrl, parser, cache, dependencies, 'partial')
	}

	public async loadSingle(id: string) {
		if (!browser) return

		const error = (e: any) => {
			console.warn(`[partial m. ${this.apiUrl}] single object load error:`, e)
			return
		}
		let respData: unknown
		try {
			let url = this.apiUrl

			if (!url.startsWith('/')) url = '/' + url
			if (!url.endsWith('/') && !url.includes('.')) url += '/'
			url += id + '/'

			const response = await fetch(getApiHost() + url, { method: 'GET' })

			if (response.status)
				if (response.ok) {
					const data = await response.json()
					respData = data

					this.data.set(id.toString(), this.parser(data))
				} else {
					error(undefined)
					return
				}
		} catch (e) {
			error(e)
			return
		}

		this.triggerUpdated()
		console.debug(`[partial m. ${this.apiUrl}] loaded or updated object ${id}`)

		this.saveToCache(respData)
	}

	public loadMultiple() {
		throw new Error('Method not implemented')
	}
}
