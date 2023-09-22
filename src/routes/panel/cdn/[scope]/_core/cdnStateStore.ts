import { writable, type Writable } from 'svelte/store';
import type { CdnAssetItem } from '../../../../../utils/generated/arcadia/CdnAssetItem';

export interface CdnStateStore {
	path: string,
    retrigger: boolean
}

export interface CdnDataStore {
    files: CdnAssetItem[],
}

export const cdnStateStore: Writable<CdnStateStore> = writable({
    path: "",
    retrigger: false
});

export const cdnDataStore: Writable<CdnDataStore> = writable({
    files: [],
});