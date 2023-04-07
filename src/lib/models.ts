import { makeApiRequest } from './api'
import { browser } from '$app/environment'
import { addReconnectListener } from './connection'

export class LoadableModel<T> {
	public isLoaded = false
	private loadingPromise: Promise<void> | undefined = undefined
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
		if (cache && !dependencies.every((dep) => dep.cache)) {
			throw new Error('Cache can only be used on models with all dependencies cached')
		}

		this.isCached = cache && browser && localStorage.getItem('cache_' + this.apiUrl) !== null

		if (cache && browser && this.isCached) {
			if (dependencies.length > 0) {
				if (dependencies.every((dep) => dep.isLoaded)) {
					console.log(
						`[model ${this.apiUrl}] all dependencies loaded or cached, loading from cache`,
					)
					this.loadFromCache()
					this.load(true)
				} else {
					console.log(
						`[model ${this.apiUrl}] some dependencies not loaded or cached, waiting for dependencies`,
					)
					;(async () => {
						await Promise.all(dependencies.map((dep) => dep.load()))
						console.log(`[model ${this.apiUrl}] all dependencies loaded, loading from cache`)
						this.loadFromCache()
						this.load(true)
					})()
				}
			} else {
				console.log(`[model ${this.apiUrl}] loading from cache`)
				this.loadFromCache()
				this.load(true)
			}
		} else if (dependencies.length > 0) {
			console.log(`[model ${this.apiUrl}] waiting for dependencies`)
			;(async () => {
				await Promise.all(dependencies.map((dep) => dep.load()))
				console.log(`[model ${this.apiUrl}] all dependencies loaded, loading`)
				await this.load()
			})()
		}
	}

	private loadFromCache() {
		if (!browser) return

		const data = JSON.parse(localStorage.getItem('cache_' + this.apiUrl)!)
		for (const item of data) {
			this.data.set(item.id.toString(), this.parser(item))
		}
		this.triggerLoaded()
		console.log(`[model ${this.apiUrl}] loaded from cache`)
	}

	public async load(skipHandlers = false): Promise<void> {
		if (!browser) return
		if (this.loadingPromise) {
			return this.loadingPromise
		}
		let resolve: () => void = () => {
			/* do nothing */
		}
		this.loadingPromise = new Promise((r) => (resolve = r))

		const response = await makeApiRequest<{ id: string | number; [key: string]: unknown }[]>(
			this.apiUrl,
			'GET',
			undefined,
			false,
		)

		if (response.status === 200 && response.data) {
			this.data.clear()
			for (const item of response.data) {
				this.data.set(item.id.toString(), this.parser(item))
			}
		} else if (!skipHandlers) {
			this.triggerLoadError()
			
			addReconnectListener(() => {
				// Attempt to reload the model when the connection is re-established (assuming that the connection was lost)
				this.load()
			})

			throw new Error('Error loading data for model ' + this.apiUrl)
		} else {
			console.log(`[model ${this.apiUrl}] suppressing load error`)
			return
		}

		this.isLoaded = true
		if (!skipHandlers) {
			for (const listener of this.loadListeners) {
				listener()
			}
		}
		console.log(`[model ${this.apiUrl}] loaded`)

		if (this.cache && browser) {
			localStorage.setItem('cache_' + this.apiUrl, JSON.stringify(response.data))
			console.log(`[model ${this.apiUrl}] cached`)
		}

		resolve()
		this.loadingPromise = Promise.resolve()
		setTimeout(() => (this.loadingPromise = undefined), 5000)
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
	}
}