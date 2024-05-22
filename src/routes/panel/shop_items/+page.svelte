<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelState';
	import Loading from '../../../components/Loading.svelte';
	import type {
		BaseSchema,
		Capability,
		Entry,
		FieldFetch,
		Schema
	} from '../../../components/admin/types';
	import logger from '$lib/logger';
	import View from '../../../components/admin/View.svelte';
	import { newField } from '../../../components/admin/helpers';
	import { hasPermString } from '@infinitybots/kittycat/perms';
	import type { ShopItem } from '$lib/generated/arcadia/ShopItem';

	class ShopItemSchema implements BaseSchema<ShopItem>, Schema<ShopItem> {
		name: string = 'shop item';
		fields: FieldFetch<ShopItem> = [
			async (cap) => {
				return {
					id: 'id',
					label: 'ID',
					type: 'text',
					helpText: 'The ID of the shop item benefit. Cannot be changed once set.',
					required: true,
					disabled: cap != 'create',
					renderMethod: 'text'
				};
			},
            {
                id: 'name',
                label: 'Name',
                type: 'text',
                helpText: 'The friendly name of the shop item benefit',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
            {
                id: 'description',
                label: 'Description',
                type: 'text',
                helpText: 'The short description of the shop item benefit',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
            {
				id: 'cents',
				label: 'Cents',
				type: 'number',
				helpText: 'Number of cents (1 cents, 0.5 cents etc.) that the item costs',
				required: true,
				disabled: false,
				renderMethod: 'text'
			},
            {
                id: 'target_types',
                label: 'Target Types',
                type: 'text[]',
                helpText: 'The target types the item can be applied to (bot/server)',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
            {
                id: 'benefits',
                label: 'Benefits',
                type: 'text[]',
                helpText: 'The benefits that the item gives when paid for/applied',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
            {
                id: 'duration',
                label: 'Duration',
                type: 'number',
                helpText: 'The duration the item lasts for in hours',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
			async (cap: Capability) => {
				if (cap == 'create') return null;
				return newField(
					'created_at',
					'Created At',
					'The date the shop item was created',
					false,
					true
				);
			},
            async (cap: Capability) => {
				if (cap == 'create') return null;
				return newField(
					'last_updated',
					'Created At',
					'The date the shop item was last updated',
					false,
					true
				);
			},
            async (cap: Capability) => {
				if (cap == 'create') return null;
				return newField(
					'created_by',
					'Created By',
					'Who created the shop item',
					false,
					true
				);
			},
            async (cap: Capability) => {
				if (cap == 'create') return null;
				return newField(
					'updated_by',
					'Updated By',
					'Who last updated the shop item',
					false,
					true
				);
			}
		];

		strictSchemaValidation: boolean = true;
		strictSchemaValidationIgnore: string[] = [];

		getCaps(): Capability[] {
			let perms: Capability[] = ['view']; // All staff can view entries
			if (
				hasPermString(
					$panelState?.staff_member?.resolved_perms || [],
					'shop_items.create'
				)
			) {
				perms.push('create');
			}
			if (
				hasPermString(
					$panelState?.staff_member?.resolved_perms || [],
					'shop_items.update'
				)
			) {
				perms.push('update');
			}
			if (
				hasPermString(
					$panelState?.staff_member?.resolved_perms || [],
					'shop_items.delete'
				)
			) {
				perms.push('delete');
			}

			return perms;
		}

		getPrimaryKey(cap: Capability) {
			return 'id';
		}

		async viewAll() {
			let res = await panelQuery({
				UpdateShopItems: {
					login_token: $panelAuthState?.loginToken || '',
					action: 'List'
				}
			});

			if (!res.ok) throw new Error(`Failed to fetch shop items: ${await res.text()}`);

			let entries: ShopItem[] = await res.json();

			return entries;
		}

		async view(key: string, value: string) {
			let entries = await this.viewAll();

			return entries.find((ce) => {
				// @ts-ignore
				return ce[key] == value;
			});
		}

		async create(data: Entry<ShopItem>) {
			let res = await panelQuery({
				UpdateShopItems: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						Create: {
                            id: data.data.id,
                            name: data.data.name,
                            description: data.data.description,
                            cents: data.data.cents,
                            target_types: data.data.target_types,
                            benefits: data.data.benefits,
                            duration: data.data.duration,
                        }
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to create shop item: ${await res.text()}`);
		}

		async update(data: Entry<ShopItem>) {
			let res = await panelQuery({
				UpdateShopItems: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						Edit: {
                            id: data.data.id,
                            name: data.data.name,
                            description: data.data.description,
                            cents: data.data.cents,
                            target_types: data.data.target_types,
                            benefits: data.data.benefits,
                            duration: data.data.duration,
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to update shop item: ${await res.text()}`);
		}

		async delete(data: Entry<ShopItem>) {
			let res = await panelQuery({
				UpdateShopItems: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						Delete: {
							id: data.data.id
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to delete shop item: ${await res.text()}`);
		}

		async viewToTable(data: ShopItem[]) {
			return {
				fields: this.fields,
				data: data?.map((d) => {
					return {
						...d,
						created_at: new Date(d?.created_at),
                        last_updated: new Date(d?.last_updated),
					};
				})
			};
		}

		async onOpen(cap: Capability, evt: string, data?: ShopItem) {
			logger.info('ShopItem', 'onOpen', { cap, evt, data });
		}

		warningBox(cap: Capability, data: ShopItem, func: () => Promise<boolean>) {
			switch (cap) {
				case 'delete':
					return {
						header: 'Confirm Deletion',
						text: `Are you sure you want to delete shop item '${data.id}' (${data.name})? This is an irreversible action.`,
						buttonStates: {
							normal: 'Delete',
							loading: 'Deleting...',
							success: 'Successfully deleted',
							error: 'Failed to delete'
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

	let schema: ShopItemSchema | undefined;

	$: {
		schema = new ShopItemSchema();
	}
</script>

{#if schema}
	<div class="system">
		<p>
			See shop_items_benefits for info on the benefits available<br /><br />
		</p>
	</div>
	<View {schema} />
{:else}
	<Loading msg="Internally creating shop item benefits schema..." />
{/if}
