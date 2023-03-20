import { makeApiRequest } from './api'
import { browser } from '$app/environment'

export class LoadableModel<T> {
	public isLoaded = false
	protected loadListeners: (() => void)[] = []
	private data: Map<string, T> = new Map()

	constructor(protected apiUrl: string, protected parser: (data: unknown) => T, autoload = true) {
		if (autoload) {
			this.load()
		}
	}

	public async load(): Promise<void> {
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
				const { id, ...rest } = item
				this.data.set(id.toString(), this.parser(rest))
			}

			this.isLoaded = true
			for (const listener of this.loadListeners) {
				listener()
			}
		} else {
			throw new Error('Error loading data for model ' + this.apiUrl)
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
}
