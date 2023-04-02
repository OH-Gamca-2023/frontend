import { makeApiRequest } from './api'
import { browser } from '$app/environment'

export class LoadableModel<T> {
	public isLoaded = false
	protected loadListeners: (() => void)[] = []
	protected loadErrorListeners: (() => void)[] = []
	private data: Map<string, T> = new Map()

	constructor(
		protected apiUrl: string,
		protected parser: (data: unknown) => T,
		autoload = true,
		protected cache = false,
	) {
		if (autoload) {
			if (cache && browser) {
				const cached = localStorage.getItem('cache_' + apiUrl)
				if (
					cached &&
					cached.length > 0 &&
					cached !== 'undefined' &&
					cached !== 'null' &&
					cached !== '[]' &&
					cached !== '{}' &&
					cached !== '""'
				) {
					const parsed = JSON.parse(cached)
					for (const item of parsed) {
						this.data.set(item.id.toString(), this.parser(item))
					}

					this.isLoaded = true
					for (const listener of this.loadListeners) {
						listener()
					}

					console.log('Loaded ' + apiUrl + ' from cache')
				}
			}
			this.load(this.isLoaded)
		}
	}

	public async load(skipHandlers = false): Promise<void> {
		if (!browser) return

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
			throw new Error('Error loading data for model ' + this.apiUrl)
		} else {
			console.warn('Suppressing error loading data for model ' + this.apiUrl)
			return
		}

		this.isLoaded = true
		if (!skipHandlers) {
			for (const listener of this.loadListeners) {
				listener()
			}
		}
		console.log('Loaded ' + this.apiUrl + ' from API')

		if (this.cache && browser) {
			localStorage.setItem('cache_' + this.apiUrl, JSON.stringify(response.data))
			console.log('Saved ' + this.apiUrl + ' to cache')
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
}
