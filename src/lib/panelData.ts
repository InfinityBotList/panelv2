import { writable, type Writable } from "svelte/store";
import type { PartialUser } from "../utils/generated/arcadia/PartialUser";
import type { PanelPerms } from "../utils/generated/arcadia/PanelPerms";

export interface PanelState {
    userId: string,
    sessionCreatedAt: Date,
    userDetails: PartialUser,
    userPerms: PanelPerms,
}

export const panelState: Writable<PanelState | null> = writable(null)