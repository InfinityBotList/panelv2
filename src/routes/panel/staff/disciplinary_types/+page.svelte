<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelState';
	import Loading from '../../../../components/Loading.svelte';
	import type { ChangelogEntry } from '$lib/generated/arcadia/ChangelogEntry';
	import type {
		BaseSchema,
		Capability,
		CustomAction,
		Entry,
		FieldFetch,
		Schema
	} from '../../../../components/admin/types';
	import logger from '$lib/logger';
	import View from '../../../../components/admin/View.svelte';
	import { newField } from '../../../../components/admin/helpers';
	import { build, hasPerm } from '$lib/perms';
	import type { StaffDisciplinaryType } from '$lib/generated/arcadia/StaffDisciplinaryType';

	/* 
export interface StaffDisciplinaryType { 
    id: string, 
    name: string, 
    description: string, 
    self_assignable: boolean, 
    perm_limits: Array<string>, 
    additory: boolean, 
    needs_approval: boolean, 
    max_expiry: number | null, 
    created_at: string, 
}
	*/

	class DisciplinaryTypeSchema implements BaseSchema<StaffDisciplinaryType>, Schema<StaffDisciplinaryType> {
		name: string = 'changelog';
		fields: FieldFetch<StaffDisciplinaryType> = [
            async (cap) => {
                return {
                    id: 'id',
                    label: 'ID',
                    type: 'text',
                    helpText: 'The ID of the disciplinary type. Cannot be changed once set.',
                    required: true,
                    disabled: cap != "create",
                    renderMethod: 'text'
                }
            },
			{
				id: 'name',
				label: 'Name',
				type: 'text',
				helpText: 'Name for the disciplinary type',
				required: false,
				disabled: false,
				renderMethod: 'text'
			},
            {
				id: 'description',
				label: 'Description',
				type: 'textarea',
				helpText: 'Description for the disciplinary type',
				required: false,
				disabled: false,
				renderMethod: 'text'
			},
			{
				id: 'self_assignable',
				label: 'Self Assignable',
				type: 'boolean',
				helpText: 'Whether or not this disciplinary type can be self-assigned by users through the panel',
				required: false,
				disabled: false,
				renderMethod: 'text'
			},
            {
				id: 'perm_limits',
				label: 'Permission Limits',
				type: 'text[]',
				helpText: 'Permissions that the user is limited to following a disciplinary action',
				required: false,
				disabled: false,
				renderMethod: 'text'
			},
            {
				id: 'additory',
				label: 'Additory Permission Limits',
				type: 'boolean',
				helpText: 'Whether or not the permission limits are additory or not',
				required: false,
				disabled: false,
				renderMethod: 'text'
			},
            {
				id: 'needs_approval',
				label: 'Needs Approval',
				type: 'boolean',
				helpText: 'Whether or not this disciplinary type needs approval before being applied',
				required: false,
				disabled: false,
				renderMethod: 'text'
			},
            {
                id: 'max_expiry',
                label: 'Max Expiry',
                type: 'number',
                helpText: 'The maximum expiry time for this disciplinary type in days',
                required: false,
                disabled: false,
                renderMethod: 'text'
            },
			async (cap: Capability) => {
				if (cap == 'create') return null;
				return newField(
					'created_at',
					'Created At',
					'The date the disciplinary type was created',
					false,
					true
				);
			}
		];

		strictSchemaValidation: boolean = true;
		strictSchemaValidationIgnore: string[] = [];

		getCaps(): Capability[] {
			let perms: Capability[] = ['view']; // All staff can view changelog entries
			if (hasPerm($panelState?.staff_member?.resolved_perms || [], build('staff_disciplinary_types', 'create'))) {
				perms.push('create');
			}
			if (hasPerm($panelState?.staff_member?.resolved_perms || [], build('staff_disciplinary_types', 'update'))) {
				perms.push('update');
			}
			if (hasPerm($panelState?.staff_member?.resolved_perms || [], build('staff_disciplinary_types', 'delete'))) {
				perms.push('delete');
			}

			return perms;
		}

		getPrimaryKey(cap: Capability) {
			return 'id';
		}

		async viewAll() {
			let res = await panelQuery({
				UpdateStaffDisciplinaryType: {
					login_token: $panelAuthState?.loginToken || '',
					action: 'ListDisciplinaryTypes'
				}
			});

			if (!res.ok) throw new Error(`Failed to fetch disciplinary types: ${await res.text()}`);

			let entries: StaffDisciplinaryType[] = await res.json();

			return entries;
		}

		async view(key: string, value: string) {
			let entries = await this.viewAll();

			return entries.find((ce) => {
				// @ts-ignore
				return ce[key] == value;
			});
		}

		async create(data: Entry<StaffDisciplinaryType>) {
			let res = await panelQuery({
				UpdateStaffDisciplinaryType: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						CreateDisciplinaryType: {
							id: data.data.id,
                            name: data.data.name,
                            description: data.data.description,
                            self_assignable: data.data.self_assignable,
                            perm_limits: data.data.perm_limits,
                            additory: data.data.additory,
                            needs_approval: data.data.needs_approval,
                            max_expiry: data.data.max_expiry
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to create disciplinary type: ${await res.text()}`);
		}

		async update(data: Entry<StaffDisciplinaryType>) {
			let res = await panelQuery({
				UpdateStaffDisciplinaryType: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						EditDisciplinaryType: {
							id: data.data.id,
                            name: data.data.name,
                            description: data.data.description,
                            self_assignable: data.data.self_assignable,
                            perm_limits: data.data.perm_limits,
                            additory: data.data.additory,
                            needs_approval: data.data.needs_approval,
                            max_expiry: data.data.max_expiry
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to update disciplinary type: ${await res.text()}`);
		}

		async delete(data: Entry<StaffDisciplinaryType>) {
			let res = await panelQuery({
				UpdateStaffDisciplinaryType: {
					login_token: $panelAuthState?.loginToken || '',
					action: {
						DeleteDisciplinaryType: {
							id: data.data.id
						}
					}
				}
			});

			if (!res.ok) throw new Error(`Failed to delete changelog entry: ${await res.text()}`);
		}

		async viewToTable(data: StaffDisciplinaryType[]) {
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

		async onOpen(cap: Capability, evt: string, data?: StaffDisciplinaryType) {
			logger.info('StaffDisciplinaryTypeSchema', 'onOpen', { cap, evt, data });
		}

		warningBox(cap: Capability, data: StaffDisciplinaryType, func: () => Promise<boolean>) {
			switch (cap) {
				case 'delete':
					return {
						header: 'Confirm Deletion',
						text: `Are you sure you want to delete staff disciplinary type '${data.name}' (${data.id})? This is an irreversible action.`,
						buttonStates: {
							normal: 'Delete Staff Disciplinary Type',
							loading: 'Deleting disciplinary type...',
							success: 'Successfully deleted this disciplinary type',
							error: 'Failed to delete disciplinary type'
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

	let schema: DisciplinaryTypeSchema | undefined;

	$: {
		schema = new DisciplinaryTypeSchema();
	}
</script>

{#if schema}
	<View {schema} />
{:else}
	<Loading msg="Internally creating disciplinary type schema..." />
{/if}
