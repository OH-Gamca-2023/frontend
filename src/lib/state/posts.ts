import { LoadingReadable, type Category } from "$lib/types";

class CategoriesReadable extends LoadingReadable<Category[]> {
    private categories: Category[] = [];

    private subscribers: Set<(value: Category[]) => void> = new Set();

    subscribe(subscriber: (value: Category[]) => void) {
        this.subscribers.add(subscriber);
        subscriber(this.categories);
        return () => this.subscribers.delete(subscriber);
    }

    async load() {
        // TODO: fetch categories from server
        await new Promise((resolve) => setTimeout(resolve, 4000));
        this.categories = [
            {
                id: 1,
                name: "Umelecké",
            },
            {
                id: 2,
                name: "Vedecké",
            },
            {
                id: 3,
                name: "Športové",
            },
            {
                id: 4,
                name: "Netradičné",
            },
        ];
        this.loadingFinished?.();
        this.subscribers.forEach((subscriber) => subscriber(this.categories));
    }
}

export const categories = new CategoriesReadable();
categories.load();