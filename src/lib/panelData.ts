import { writable, type Writable } from 'svelte/store';
import type { PartialUser } from '../utils/generated/arcadia/PartialUser';
import type { PanelPerms } from '../utils/generated/arcadia/PanelPerms';
import type { Capability } from '../utils/generated/arcadia/Capability';
import type { CoreConstants } from '../utils/generated/arcadia/CoreConstants';
import type { TargetType } from '../utils/generated/arcadia/TargetType';
import type { AuthData } from '../utils/generated/arcadia/AuthData';

export interface PanelState {
	auth: AuthData,
	userDetails: PartialUser;
	userPerms: PanelPerms;
	capabilities: Capability[];
	coreConstants: CoreConstants;
	rpcSupportedTargetTypes: TargetType[]
}

export const panelState: Writable<PanelState | null> = writable(null);
