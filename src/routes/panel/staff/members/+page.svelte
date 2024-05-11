<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import type { StaffMember } from '$lib/generated/arcadia/StaffMember';
	import { panelAuthState } from '$lib/panelAuthState';
	import Loading from '../../../../components/Loading.svelte';
	import ErrorComponent from '../../../../components/Error.svelte';
	import { panelState } from '$lib/panelState';
	import { hasPermString } from '@infinitybots/kittycat/perms';
	import Icon from '@iconify/svelte';
	import type { StaffPosition } from '$lib/generated/arcadia/StaffPosition';
	import StaffMemberCard from './StaffMemberCard.svelte';

	const allActions = {} as const;

	type Action = keyof typeof allActions;

	let openAction: Action | null = null;

	const open = (action: Action) => {
		if (openAction == action) {
			openAction = null;
			return;
		}
		openAction = action;
	};

	const getAllActions = (): Action[] => {
		let available: Action[] = [];

		for (let perm of Object.keys(allActions)) {
			if (
				hasPermString($panelState?.staff_member?.resolved_perms || [], `staff_positions.${perm}`)
			) {
				available.push(perm as Action);
			}
		}

		return available;
	};

	let availableActions: Action[] = getAllActions();

	const fetchStaffMembersList = async () => {
		let positionRes = await panelQuery({
			UpdateStaffPositions: {
				login_token: $panelAuthState?.loginToken || '',
				action: 'ListPositions'
			}
		});

		if (!positionRes.ok) {
			throw new Error('Failed to fetch staff position list');
		}

		let staffPositionList: StaffPosition[] = await positionRes.json();

		let membersRes = await panelQuery({
			UpdateStaffMembers: {
				login_token: $panelAuthState?.loginToken || '',
				action: 'ListMembers'
			}
		});

		if (!membersRes.ok) {
			throw new Error('Failed to fetch staff members list');
		}

		let staffMembersList: StaffMember[] = await membersRes.json();

		return {
			staffPositionList,
			staffMembersList
		};
	};

	// Actions
</script>

<h1 class="text-3xl font-semibold">Staff Members</h1>

{#await fetchStaffMembersList()}
	<Loading msg={'Loading staff positions...'} />
{:then data}
	{#if availableActions?.length}
		<h2 class="mt-3 mb-1 text-xl">Actions</h2>
		<div class="border rounded-md mb-7">
			{#each availableActions as action}
				<button
					on:click={() => {
						open(action);
					}}
					class="px-2 py-3 text-white border-r hover:text-gray-300 focus:outline-none"
				>
					<Icon icon={allActions[action][0]} class={'text-2xl inline-block align-bottom'} />
					{openAction == action ? 'Close' : allActions[action][1]}
				</button>
			{/each}
		</div>
	{/if}

	{#if openAction}
		<div class="p-3 border rounded-md mb-7">
			<!--Fill in here-->
		</div>
	{/if}

	{#each data?.staffMembersList as member}
		<StaffMemberCard staffMember={member} />
	{/each}
{:catch error}
	<ErrorComponent msg={error?.toString() || 'Unknown erro'} />
{/await}
