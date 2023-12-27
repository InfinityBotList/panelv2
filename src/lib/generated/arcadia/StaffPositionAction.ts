// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { Link } from './Link';

export type StaffPositionAction =
	| 'ListPositions'
	| { SwapIndex: { a: string; b: string } }
	| { SetIndex: { id: string; index: number } }
	| {
			CreatePosition: {
				name: string;
				role_id: string;
				corresponding_roles: Array<Link>;
				perms: Array<string>;
				index: number;
			};
	  }
	| {
			EditPosition: {
				id: string;
				name: string;
				role_id: string;
				corresponding_roles: Array<Link>;
				perms: Array<string>;
			};
	  }
	| { DeletePosition: { id: string } };
