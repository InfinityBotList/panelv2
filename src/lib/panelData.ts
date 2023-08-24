import { writable, type Writable } from "svelte/store";
import type { PartialUser } from "../utils/generated/arcadia/PartialUser";
import type { PanelPerms } from "../utils/generated/arcadia/PanelPerms";
import type { Capability } from "../utils/generated/arcadia/Capability";

export interface PanelState {
    userId: string,
    sessionCreatedAt: Date,
    userDetails: PartialUser,
    userPerms: PanelPerms,
    capabilities: Capability[]
}

export const panelState: Writable<PanelState | null> = writable(null)