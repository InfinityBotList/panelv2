// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { StaffPosition } from './StaffPosition';

export interface StaffMember {
	user_id: string;
	positions: Array<StaffPosition>;
	perm_overrides: Array<string>;
	resolved_perms: Array<string>;
	no_autosync: boolean;
	created_at: string;
}
