import { getApiHost } from '$lib/api/data'
import { browser } from '$app/environment'
import { addReconnectListener } from '../connection'
import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'

export class LoadableModel<T> implements Readable<{ [key: string]: T }> {
	public isLoaded = false

	private loadRan = false
	private loadingPromise: Promise<void> | undefined = undefined
	private resolveLoadingPromise: (() => void) | undefined = undefined

	public isCached = false

	protected loadListeners: (() => void)[] = []
	protected loadErrorListeners: (() => void)[] = []
	protected subscribers: Subscriber<{ [key: string]: T }>[] = []

	private data: Map<string, T> = new Map()

	constructor(
		protected apiUrl: string,
		protected parser: (data: unknown) => T,
		protected cache = false,
		protected dependencies: LoadableModel<any>[] = [],
		protected list = true,
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
					this.loadFromCache()
					this.load(true)
				} else {
					console.debug(
						`[model ${this.apiUrl}] some dependencies not loaded or cached, waiting for dependencies`,
					)
					;(async () => {
						await Promise.all(dependencies.map((dep) => dep.load()))
						console.debug(`[model ${this.apiUrl}] all dependencies loaded, loading from cache`)
						this.loadFromCache()
						this.load(true)
					})()
				}
			} else {
				console.debug(`[model ${this.apiUrl}] loading from cache`)
				this.loadFromCache()
				this.load(true)
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
	private loadFromCache() {
		if (!browser) return

		const data = JSON.parse(localStorage.getItem('cache_' + this.apiUrl)!)
		if (this.list) {
			for (const item of data) {
				this.data.set(item.id.toString(), this.parser(item))
			}
		} else this.data.set('0', this.parser(data))

		this.triggerLoaded()
		console.debug(`[model ${this.apiUrl}] loaded from cache`)
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

			const response = await fetch(getApiHost() + url, { method: 'GET' })

			if (response.status)
				if (response.ok) {
					const data = await response.json()
					respData = data
					this.data.clear()
					if (this.list) {
						for (const item of data) {
							this.data.set(item.id.toString(), this.parser(item))
						}
					} else this.data.set('0', this.parser(data))
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
		console.debug(`[model ${this.apiUrl}] loaded`)

		if (this.cache && respData) {
			localStorage.setItem('cache_' + this.apiUrl, JSON.stringify(respData))
			console.debug(`[model ${this.apiUrl}] cached`)
		}
	}

	protected get(id: string | number): T | undefined {
		if (!this.list) id = 0
		return this.data.get(id.toString())
	}

	protected getAll(): { [key: string]: T; } {
		return Object.fromEntries(this.data)
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

	public subscribe(run: Subscriber<{ [key: string]: T; }>, invalidate?: ((value?: { [key: string]: T; } | undefined) => void) | undefined): Unsubscriber {
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
