import { getApiHost } from '$lib/api/data'
import { browser } from '$app/environment'
import { addReconnectListener } from '../connection'

export class LoadableModel<T> {
	public isLoaded = false

	private loadRan = false
	private loadingPromise: Promise<void> | undefined = undefined
	private resolveLoadingPromise: (() => void) | undefined = undefined

	public isCached = false

	protected loadListeners: (() => void)[] = []
	protected loadErrorListeners: (() => void)[] = []

	private data: Map<string, T> = new Map()

	constructor(
		protected apiUrl: string,
		protected parser: (data: unknown) => T,
		protected cache = false,
		protected dependencies: LoadableModel<unknown>[] = [],
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
	}

	/**
	 * Attempts to load the model from the cache
	 */
	private loadFromCache() {
		if (!browser) return

		const data = JSON.parse(localStorage.getItem('cache_' + this.apiUrl)!)
		for (const item of data) {
			this.data.set(item.id.toString(), this.parser(item))
		}
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

		const error = () => {
			if (!force) {
				this.triggerLoadError()

				addReconnectListener(() => {
					// Attempt to reload the model when the connection is re-established (assuming that the connection was lost)
					this.load()
				})

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
			if (!url.endsWith('/')) url += '/'

			const response = await fetch(getApiHost() + url, { method: 'GET' })

			if (response.status)
				if (response.ok) {
					const data = await response.json()
					respData = data
					this.data.clear()
					for (const item of data) {
						this.data.set(item.id.toString(), this.parser(item))
					}
				} else {
					error()
					return
				}
		} catch (e) {
			error()
			return
		}

		this.isLoaded = true
		if (!force) {
			this.triggerLoaded()
		}
		console.debug(`[model ${this.apiUrl}] loaded`)

		if (this.cache && respData) {
			localStorage.setItem('cache_' + this.apiUrl, JSON.stringify(respData))
			console.debug(`[model ${this.apiUrl}] cached`)
		}
	}

	public get(id: string | number): T | undefined {
		return this.data.get(id.toString())
	}

	public getAll(): T[] {
		return Array.from(this.data.values())
	}

	public get size(): number {
		return this.data.size
	}

	public get isEmpty(): boolean {
		return this.data.size === 0
	}

	public get isNotEmpty(): boolean {
		return this.data.size > 0
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

	public triggerLoadError() {
		this.loadErrorListeners.forEach((listener) => listener())
	}

	public triggerLoaded() {
		this.isLoaded = true
		this.loadListeners.forEach((listener) => listener())

		if (this.resolveLoadingPromise) {
			this.resolveLoadingPromise()
		}
	}
}
