import { writable, type Writable } from 'svelte/store';

export interface PanelAuthState {
	url: string;
	queryPath: string;
	loginToken: string;
}

export const panelAuthState: Writable<PanelAuthState | null> = writable(null);
