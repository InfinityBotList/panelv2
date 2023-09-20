import { writable, type Writable } from 'svelte/store';

export interface CdnStateStore {
	path: string
}

export const cdnStateStore: Writable<CdnStateStore> = writable({
    path: ""
});
