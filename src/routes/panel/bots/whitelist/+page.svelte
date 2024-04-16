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
	import { build, hasPerm } from '$lib/perms';
	import type { BotWhitelist } from '$lib/generated/arcadia/BotWhitelist';

	/* 
export interface BotWhitelist { 
    bot_id: string, 
    reason: string, 
    created_at: string, 
}
	*/

	class WhitelistSchema implements BaseSchema<BotWhitelist>, Schema<BotWhitelist> {
		name: string = 'bot whitelist';
		fields: FieldFetch<BotWhitelist> = [
            async (cap) => {
                return {
                    id: 'bot_id',
                    label: 'Bot ID',
                    type: 'text',
                    helpText: 'The Bot ID to whitelist. Cannot be changed once set.',
                    required: true,
                    disabled: cap != "create",
                    renderMethod: 'text'
                }
            },
			{
				id: 'reason',
				label: 'Reason',
				type: 'textarea',
				helpText: 'The reason for whitelisting the bot',
				required: false,
				disabled: false,
				renderMethod: 'text'
			},
			async (cap: Capability) => {
				if (cap == 'create') return null;
				return newField(
					'created_at',
					'Created At',
					'The date the bot was whitelisted',
					false,
					true
				);
			}
		];

		strictSchemaValidation: boolean = true;
		strictSchemaValidationIgnore: string[] = [];

		getCaps(): Capability[] {
			let perms: Capability[] = ['view']; // All staff can view changelog entries
			if (hasPerm($panelState?.staff_member?.resolved_perms || [], build('bot_whitelist', 'create'))) {
				perms.push('create');
			}
			if (hasPerm($panelState?.staff_member?.resolved_perms || [], build('bot_whitelist', 'update'))) {
				perms.push('update');
			}
			if (hasPerm($panelState?.staff_member?.resolved_perms || [], build('bot_whitelist', 'delete'))) {
				perms.push('delete');
			}

			return perms;
		}

		getPrimaryKey(cap: Capability) {
			return 'id';
		}

		async viewAll() {
			let res = await panelQuery({
				UpdateBotWhitelist: {
					login_token: $panelAuthState?.loginToken || '',
					action: 'List'
				}
			});

			if (!res.ok) throw new Error(`Failed to fetch bot whitelist: ${await res.text()}`);

			let entries: BotWhitelist[] = await res.json();

			return entries;
		}

		async view(key: string, value: string) {
			let entries = await this.viewAll();

			return entries.find((ce) => {
				// @ts-ignore
				return ce[key] == value;
			});
		}

		async create(data: Entry<BotWhitelist>) {
			let res = await panelQuery({
				UpdateBotWhitelist: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						Add: {
							bot_id: data.data.bot_id,
                            reason: data.data.reason
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to create bot whitelist entry: ${await res.text()}`);
		}

		async update(data: Entry<BotWhitelist>) {
			let res = await panelQuery({
				UpdateBotWhitelist: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						Edit: {
							bot_id: data.data.bot_id,
                            reason: data.data.reason
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to update bot whitelist entry: ${await res.text()}`);
		}

		async delete(data: Entry<BotWhitelist>) {
			let res = await panelQuery({
				UpdateBotWhitelist: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						Delete: {
							bot_id: data.data.bot_id
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to delete bot whitelist entry: ${await res.text()}`);
		}

		async viewToTable(data: BotWhitelist[]) {
			return {
				fields: this.fields,
				data: data?.map((d) => {
					return {
						...d,
						created_at: new Date(d?.created_at)
					};
				})
			};
		}

		async onOpen(cap: Capability, evt: string, data?: BotWhitelist) {
			logger.info('BotWhitelistSchema', 'onOpen', { cap, evt, data });
		}

		warningBox(cap: Capability, data: BotWhitelist, func: () => Promise<boolean>) {
			switch (cap) {
				case 'delete':
					return {
						header: 'Confirm Deletion',
						text: `Are you sure you want to delete bot whitelist entry '${data.bot_id}'? This is an irreversible action.`,
						buttonStates: {
							normal: 'Delete Entry',
							loading: 'Deleting entry...',
							success: 'Successfully deleted this entry',
							error: 'Failed to delete entry'
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

	let schema: WhitelistSchema | undefined;

	$: {
		schema = new WhitelistSchema();
	}
</script>

{#if schema}
	<View {schema} />
{:else}
	<Loading msg="Internally creating bot whitelist schema..." />
{/if}
