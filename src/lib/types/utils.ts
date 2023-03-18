import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'

export abstract class LoadingReadable<T> implements Readable<T> {
	abstract subscribe(
		this: void,
		run: Subscriber<T>,
		invalidate?: ((value?: T | undefined) => void) | undefined,
	): Unsubscriber

	protected loadingFinished: (() => void) | undefined
	public loaded = new Promise<void>((resolve) => (this.loadingFinished = resolve))

	abstract load(): Promise<T | void>
}
