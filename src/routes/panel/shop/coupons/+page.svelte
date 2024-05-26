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
	import { hasPermString } from '@infinitybots/kittycat/perms';
	import type { ShopCoupon } from '$lib/generated/arcadia/ShopCoupon';

	class ShopCouponSchema implements BaseSchema<ShopCoupon>, Schema<ShopCoupon> {
		name: string = 'shop coupon';
		fields: FieldFetch<ShopCoupon> = [
			async (cap) => {
				return {
					id: 'id',
					label: 'ID',
					type: 'text',
					helpText: 'The ID of the shop coupon. Cannot be changed once set.',
					required: true,
					disabled: cap != 'create',
					renderMethod: 'text'
				};
			},
            {
                id: 'code',
                label: 'Code',
                type: 'text',
                helpText: 'The coupons code',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
            {
                id: 'public',
                label: 'Public',
                type: 'boolean',
                helpText: 'Whether or not the coupon is publicly viewable in the shop page or not',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
            {
				id: 'max_uses',
				label: 'Max Uses',
				type: 'number',
				helpText: 'Maximum number of uses the coupon can have. If null (0), the coupon can be used an unlimited number of times',
				required: true,
				disabled: false,
				renderMethod: 'text'
			},
            {
                id: 'target_types',
                label: 'Target Types',
                type: 'text[]',
                helpText: 'The target types the coupon can be applied to (bot/server). If empty, the coupon can be applied to all target types',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
            {
                id: 'reuse_wait_duration',
                label: 'Reuse Wait Duration',
                type: 'number',
                helpText: 'The number of hours that a user must wait for before they can reuse the coupon. If null (0), the coupon can be reused immediately',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
            {
                id: 'expiry',
                label: 'Expiry',
                type: 'number',
                helpText: 'The number of hours from creation that the coupon will expire. If null (0), the coupon will never expire',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
			{
                id: 'applicable_items',
                label: 'Applicable Items',
                type: 'text[]',
                helpText: 'The items that the coupon can be applied to. If empty, the coupon can be applied to all items',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
			{
                id: 'cents',
                label: 'Cents',
                type: 'number',
                helpText: 'The number of cents the coupon will apply to the item. If null (0), the coupon will apply the full price',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
			{
                id: 'requirements',
                label: 'Requirements',
                type: 'text[]',
                helpText: 'The requirements that must be met for the coupon to be applied. If empty, the coupon has no requirements',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
			{
                id: 'allowed_users',
                label: 'Allowed Users',
                type: 'text[]',
                helpText: 'The users who can apply said coupon. If empty, the coupon can be applied by all users',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
			{
                id: 'usable',
                label: 'Usable',
                type: 'boolean',
                helpText: 'Whether or not the coupon is usable or not',
                required: true,
                disabled: false,
                renderMethod: 'text'
            },
			async (cap: Capability) => {
				if (cap == 'create') return null;
				return newField(
					'created_at',
					'Created At',
					'The date the shop coupon was created',
					false,
					true
				);
			},
            async (cap: Capability) => {
				if (cap == 'create') return null;
				return newField(
					'last_updated',
					'Last Updated',
					'The date the shop coupon was last updated',
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
			let perms: Capability[] = [];
			if (
				hasPermString(
					$panelState?.staff_member?.resolved_perms || [],
					'shop_coupons.list'
				)
			) {
				perms.push('view');
			}

			if (
				hasPermString(
					$panelState?.staff_member?.resolved_perms || [],
					'shop_coupons.create'
				)
			) {
				perms.push('create');
			}
			if (
				hasPermString(
					$panelState?.staff_member?.resolved_perms || [],
					'shop_coupons.update'
				)
			) {
				perms.push('update');
			}
			if (
				hasPermString(
					$panelState?.staff_member?.resolved_perms || [],
					'shop_coupons.delete'
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
				UpdateShopCoupons: {
					login_token: $panelAuthState?.loginToken || '',
					action: 'List'
				}
			});

			if (!res.ok) throw new Error(`Failed to fetch shop items: ${await res.text()}`);

			let entries: ShopCoupon[] = await res.json();

			return entries;
		}

		async view(key: string, value: string) {
			let entries = await this.viewAll();

			return entries.find((ce) => {
				// @ts-ignore
				return ce[key] == value;
			});
		}

		async create(data: Entry<ShopCoupon>) {
			let res = await panelQuery({
				UpdateShopCoupons: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						Create: {
                            id: data.data.id,
							code: data.data.code,
							public: data.data.public,
							max_uses: data.data.max_uses || null,
							target_types: data.data.target_types,
							reuse_wait_duration: data.data.reuse_wait_duration || null,
							expiry: data.data.expiry || null,
							applicable_items: data.data.applicable_items,
							cents: data.data.cents || null,
							requirements: data.data.requirements,
							usable: data.data.usable,
							allowed_users: data.data.allowed_users
                        }
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to create shop item: ${await res.text()}`);
		}

		async update(data: Entry<ShopCoupon>) {
			let res = await panelQuery({
				UpdateShopCoupons: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						Edit: {
                            id: data.data.id,
							code: data.data.code,
							public: data.data.public,
							max_uses: data.data.max_uses || null,
							target_types: data.data.target_types,
							reuse_wait_duration: data.data.reuse_wait_duration || null,
							expiry: data.data.expiry || null,
							applicable_items: data.data.applicable_items,
							cents: data.data.cents || null,
							requirements: data.data.requirements,
							usable: data.data.usable,
							allowed_users: data.data.allowed_users
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to update shop item: ${await res.text()}`);
		}

		async delete(data: Entry<ShopCoupon>) {
			let res = await panelQuery({
				UpdateShopCoupons: {
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

		async viewToTable(data: ShopCoupon[]) {
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

		async onOpen(cap: Capability, evt: string, data?: ShopCoupon) {
			logger.info('ShopCoupon', 'onOpen', { cap, evt, data });
		}

		warningBox(cap: Capability, data: ShopCoupon, func: () => Promise<boolean>) {
			switch (cap) {
				case 'delete':
					return {
						header: 'Confirm Deletion',
						text: `Are you sure you want to delete shop coupon '${data.id}' (${data.code})? This is an irreversible action.`,
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

	let schema: ShopCouponSchema | undefined;

	$: {
		schema = new ShopCouponSchema();
	}
</script>

{#if schema}
	<View {schema} />
{:else}
	<Loading msg="Internally creating shop coupon schema..." />
{/if}
