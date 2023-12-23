import { writable, type Writable } from 'svelte/store';

export interface OBBoundary {
    userId: string;
    token: string;
}

export const obBoundary: Writable<OBBoundary | null> = writable(null);