import { writable, type Writable } from 'svelte/store';
import type { PartialUser } from '$lib/generated/arcadia/PartialUser';
import type { CoreConstants } from '$lib/generated/arcadia/CoreConstants';
import type { TargetType } from '$lib/generated/arcadia/TargetType';
import type { AuthData } from '$lib/generated/arcadia/AuthData';
import type { InstanceConfig } from './generated/arcadia/InstanceConfig';
import type { StaffMember } from './generated/arcadia/StaffMember';

export interface PanelState {
	hello: InstanceConfig;
	auth: AuthData;
	userDetails: PartialUser;
	userPerms: StaffMember;
	coreConstants: CoreConstants;
	rpcSupportedTargetTypes: TargetType[];
}

export const panelState: Writable<PanelState | null> = writable(null);
