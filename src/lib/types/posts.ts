import type { Discipline, Tag } from "./disciplines";
import type { Category, User } from "./users";

export interface Post {
    id: number;
    title: string;
    content: string;
    author: User;
    date: number; // Unix timestamp

    related_disciplines: Discipline[];
    affected_categories: Category[];
    tags: Tag[];

    disable_comments: boolean;
}

export interface Comment {
    id: number;
    post: Post;
    author: User;
    content: string;
    date: number; // Unix timestamp

    parent: Comment | null;
}