import { writable, type Writable } from "svelte/store";

export interface PanelState {
    userId: string,
    sessionCreatedAt: Date,
}

export const panelState: Writable<PanelState | null> = writable(null)