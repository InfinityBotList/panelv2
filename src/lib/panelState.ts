import { writable, type Writable } from "svelte/store";

export interface PanelState {
    url: string;
    loginToken: string;
}

export const panelState: Writable<PanelState | null> = writable(null)