import { writable, type Writable } from "svelte/store";
import type { PanelUserDetails } from "../utils/generated/arcadia/PanelUserDetails";

export interface PanelState {
    userId: string,
    sessionCreatedAt: Date,
    userDetails: PanelUserDetails,
}

export const panelState: Writable<PanelState | null> = writable(null)