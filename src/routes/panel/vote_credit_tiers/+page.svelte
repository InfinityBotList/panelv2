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
	import { build, hasPerm } from '$lib/perms';
	import type { VoteCreditTier } from '$lib/generated/arcadia/VoteCreditTier';
	import OrderedList from '../../../components/OrderedList.svelte';
	import ListItem from '../../../components/ListItem.svelte';

	/* 
export interface VoteCreditTier { 
    id: string, 
    position: number, 
    cents: number, 
    votes: number, 
    created_at: string, 
}	*/

	class VoteCreditTierSchema implements BaseSchema<VoteCreditTier>, Schema<VoteCreditTier> {
		name: string = 'vote credit tiers';
		fields: FieldFetch<VoteCreditTier> = [
            async (cap) => {
                return {
                    id: 'id',
                    label: 'ID',
                    type: 'text',
                    helpText: 'The ID of the vote credit tier. Cannot be changed once set.',
                    required: true,
                    disabled: cap != "create",
                    renderMethod: 'text'
                }
            },
			{
				id: 'position',
				label: 'Position',
				type: 'number',
				helpText: 'The position of the vote credit tier',
				required: true,
				disabled: false,
				renderMethod: 'text'
			},
            {
				id: 'cents',
				label: 'Cents',
				type: 'number',
				helpText: 'Number of cents (1 cents, 0.5 cents etc.) per vote',
				required: true,
				disabled: false,
				renderMethod: 'text'
			},
			{
				id: 'votes',
				label: 'Votes',
				type: 'number',
				helpText: 'How many votes this specific slab should be for',
				required: true,
				disabled: false,
				renderMethod: 'text'
			},
			async (cap: Capability) => {
				if (cap == 'create') return null;
				return newField(
					'created_at',
					'Created At',
					'The date the vote credit tier was created',
					false,
					true
				);
			}
		];

		strictSchemaValidation: boolean = true;
		strictSchemaValidationIgnore: string[] = [];

		getCaps(): Capability[] {
			let perms: Capability[] = ['view']; // All staff can view entries
			if (hasPerm($panelState?.staff_member?.resolved_perms || [], build('vote_credit_tiers', 'create'))) {
				perms.push('create');
			}
			if (hasPerm($panelState?.staff_member?.resolved_perms || [], build('vote_credit_tiers', 'update'))) {
				perms.push('update');
			}
			if (hasPerm($panelState?.staff_member?.resolved_perms || [], build('vote_credit_tiers', 'delete'))) {
				perms.push('delete');
			}

			return perms;
		}

		getPrimaryKey(cap: Capability) {
			return 'id';
		}

		async viewAll() {
			let res = await panelQuery({
				UpdateVoteCreditTiers: {
					login_token: $panelAuthState?.loginToken || '',
					action: 'ListTiers'
				}
			});

			if (!res.ok) throw new Error(`Failed to fetch disciplinary types: ${await res.text()}`);

			let entries: VoteCreditTier[] = await res.json();

			return entries;
		}

		async view(key: string, value: string) {
			let entries = await this.viewAll();

			return entries.find((ce) => {
				// @ts-ignore
				return ce[key] == value;
			});
		}

		async create(data: Entry<VoteCreditTier>) {
			let res = await panelQuery({
				UpdateVoteCreditTiers: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						CreateTier: {
							id: data.data.id,
                            position: data.data.position,
                            cents: data.data.cents,
                            votes: data.data.votes
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to create vote credit tier: ${await res.text()}`);
		}

		async update(data: Entry<VoteCreditTier>) {
			let res = await panelQuery({
				UpdateVoteCreditTiers: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						EditTier: {
							id: data.data.id,
                            position: data.data.position,
                            cents: data.data.cents,
                            votes: data.data.votes
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to update disciplinary type: ${await res.text()}`);
		}

		async delete(data: Entry<VoteCreditTier>) {
			let res = await panelQuery({
				UpdateVoteCreditTiers: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						DeleteTier: {
							id: data.data.id
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to delete changelog entry: ${await res.text()}`);
		}

		async viewToTable(data: VoteCreditTier[]) {
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

		async onOpen(cap: Capability, evt: string, data?: VoteCreditTier) {
			logger.info('VoteCreditTier', 'onOpen', { cap, evt, data });
		}

		warningBox(cap: Capability, data: VoteCreditTier, func: () => Promise<boolean>) {
			switch (cap) {
				case 'delete':
					return {
						header: 'Confirm Deletion',
						text: `Are you sure you want to delete vote credit tier '${data.id}' (${data.position})? This is an irreversible action.`,
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

	let schema: VoteCreditTierSchema | undefined;

	$: {
		schema = new VoteCreditTierSchema();
	}
</script>

{#if schema}
    <div class="system">
        <p>
            Vote credits are tier based through slabs<br/><br/>
            
            (e.g.)For the following tiers<br/><br/>
        </p>
        <OrderedList>
            <ListItem>Tier 1: 100 votes at 0.10 cents</ListItem>
            <ListItem>Tier 2: 200 votes at 0.05 cents</ListItem>
            <ListItem>Tier 3: 50 votes at 0.025 cents</ListItem>
        </OrderedList>
        <p>
            Would mean 625 votes would be split as the following:
        </p>
        <OrderedList>
            <ListItem>100 votes: 0.10 cents [Tier 1]</ListItem>
            <ListItem>Next 200 votes: 0.05 cents [Tier 2]</ListItem>
            <ListItem>Next 50 votes: 0.025 cents [Tier 3]</ListItem>
            <ListItem>Last 275 votes: 0.025 cents [last tier used at end of tiering]</ListItem>
        </OrderedList>
    </div>
	<View {schema} />
{:else}
	<Loading msg="Internally creating vote credit tiers schema..." />
{/if}
