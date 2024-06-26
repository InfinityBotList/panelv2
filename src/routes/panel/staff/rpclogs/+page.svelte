<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelState';
	import Loading from '../../../../components/Loading.svelte';
	import type {
		BaseSchema,
		Capability,
		Entry,
		FieldFetch,
		Schema
	} from '../../../../components/admin/types';
	import logger from '$lib/logger';
	import View from '../../../../components/admin/View.svelte';
	import { newField } from '../../../../components/admin/helpers';
	import type { RPCLogEntry } from '$lib/generated/arcadia/RPCLogEntry';
	import { hasPermString } from '@infinitybots/kittycat/perms';

    /**
// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type RPCLogEntry = {
     id: string;
	user_id: string;
	method: string;
	state: string;
	data: any;
	created_at: string;
};
     */

	class RPCLogEntrySchema implements BaseSchema<RPCLogEntry>, Schema<RPCLogEntry> {
		name: string = 'rpc logs';
		fields: FieldFetch<RPCLogEntry> = [
			async (cap) => {
				return {
					id: 'id',
					label: 'ID',
					type: 'text',
					helpText: 'The ID of the rpc log entry. Cannot be changed once set.',
					required: true,
					disabled: cap != 'create',
					renderMethod: 'text'
				};
			},
			{
				id: 'user_id',
				label: 'User ID',
				type: 'text',
				helpText: 'The ID of the user that made the rpc call',
				required: true,
				disabled: false,
				renderMethod: 'text'
			},
			{
				id: 'method',
				label: 'Method',
				type: 'text',
				helpText: 'The RPC method that was called',
				required: true,
				disabled: false,
				renderMethod: 'text'
			},
			{
				id: 'state',
				label: 'Votes',
				type: 'text',
				helpText: 'The final/current state of the RPC call',
				required: true,
				disabled: false,
				renderMethod: 'text'
			},
			{
				id: 'data',
				label: 'Data',
				type: 'text',
				helpText: 'The json data that was sent with the RPC call',
				required: true,
				disabled: false,
				renderMethod: 'text'
			},
                        {
                                id: 'created_at',
                                label: 'Created At',
                                type: 'text',
                                helpText: 'The date/time the entry was created at',
                                required: true,
                                disabled: false,
                                renderMethod: 'text'
                        },
		];

		strictSchemaValidation: boolean = true;
		strictSchemaValidationIgnore: string[] = [];

		getCaps(): Capability[] {
			let perms: Capability[] = [];
			if (
				hasPermString(
					$panelState?.staff_member?.resolved_perms || [],
					'rpc_logs.view'
				)
			) {
				perms.push('view');
			}

			return perms;
		}

		getPrimaryKey(cap: Capability) {
			return 'id';
		}

		async viewAll() {
			let res = await panelQuery({
				GetRpcLogEntries: {
					login_token: $panelAuthState?.loginToken || '',
				}
			});

			if (!res.ok) throw new Error(`Failed to fetch disciplinary types: ${await res.text()}`);

			let entries: RPCLogEntry[] = await res.json();

			return entries;
		}

		async view(key: string, value: string) {
			let entries = await this.viewAll();

			return entries.find((ce) => {
				// @ts-ignore
				return ce[key] == value;
			});
		}

		async create(data: Entry<RPCLogEntry>) {
			throw new Error('Not implemented');
		}

		async update(data: Entry<RPCLogEntry>) {
			throw new Error('Not implemented');
		}

		async delete(data: Entry<RPCLogEntry>) {
			throw new Error('Not implemented');
		}

		async viewToTable(data: RPCLogEntry[]) {
			return {
				fields: this.fields,
				data: data?.map((d) => {
					return {
						...d,
                        data: JSON.stringify(d.data),
						created_at: new Date(d?.created_at)
					};
				})
			};
		}

		async onOpen(cap: Capability, evt: string, data?: RPCLogEntry) {
			logger.info('VoteCreditTier', 'onOpen', { cap, evt, data });
		}

		warningBox(cap: Capability, data: RPCLogEntry, func: () => Promise<boolean>) {
			switch (cap) {
				case 'delete':
					return {
						header: 'Confirm Deletion',
						text: `Are you sure you want to delete this? This is an irreversible action.`,
						buttonStates: {
							normal: 'Delete Tier',
							loading: 'Deleting tier...',
							success: 'Successfully deleted this tier',
							error: 'Failed to delete tier'
						},
						onConfirm: func
					};
				default:
					throw new Error(`Unsupported capability for warningBox: ${cap}`);
			}
		}

		constructor() {
			// Freeze all properties on the class
			for (let key of Object.keys(this)) {
				Object.defineProperty(this, key, {
					writable: false,
					configurable: false
				});
			}

			Object.freeze(this);
		}
	}

	let schema: RPCLogEntrySchema | undefined;

	$: {
		schema = new RPCLogEntrySchema();
	}
</script>

{#if schema}
	<View {schema} />
{:else}
	<Loading msg="Internally creating rpc logs schema..." />
{/if}
