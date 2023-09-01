<script lang="ts">
	import { panelAuthState } from '$lib/panelAuthState';
	import Loading from '../../../../components/Loading.svelte';
	import Error from '../../../../components/Error.svelte';
	import type { PanelQuery } from '../../../../utils/generated/arcadia/PanelQuery';
	import type { QueueBot } from '../../../../utils/generated/arcadia/QueueBot';
	import Card from '../../../../components/Card.svelte';
	import { panelState } from '$lib/panelData';
	import CardLinkButton from '../../../../components/CardLinkButton.svelte';
	import Column from '../../../../components/Column.svelte';
	import { fetchClient } from '$lib/fetch';
	import QueueActions from '../../../../components/QueueActions.svelte';
	import type QueueActionTypes from '$lib/comp_types/QueueActions';
	import type { RPCMethod } from '../../../../utils/generated/arcadia/RPCMethod';

	const fetchQueueBots = async () => {
		let lp: PanelQuery = {
			BotQueue: {
				login_token: $panelAuthState?.loginToken || ''
			}
		};

		let res = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});
		let bots: QueueBot[] = await res.json();

		return bots;
	};

	enum RPCAction {
		Claim = 0,
		Unclaim = 1,
		Approve = 2,
		Deny = 3
	}

	const QueueRPCActions = async (
		TargetID: string,
		ForceAction: boolean = false,
		Reason: string,
		Action: RPCAction
	) => {
		let Method: RPCMethod;

		switch (Action) {
			case RPCAction.Claim:
				Method = { Claim: { target_id: TargetID, force: ForceAction } };
				break;
			case RPCAction.Unclaim:
				Method = { Unclaim: { target_id: TargetID, reason: Reason } };
				break;
			case RPCAction.Approve:
				Method = { Approve: { target_id: TargetID, reason: Reason } };
				break;
			case RPCAction.Deny:
				Method = { Deny: { target_id: TargetID, reason: Reason } };
				break;
		}

		let lp: PanelQuery = {
			ExecuteRpc: {
				login_token: $panelAuthState?.loginToken || '',
				target_type: 'Bot',
				method: Method
			}
		};

		let res = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});

		if (res.ok) {
			// Success
			window.alert("[RPC Action] => Success!");
		} else window.alert(`[RPC Action] => Failed! ({await res.json()})`);
	};

	const Actions: QueueActionTypes[] = [
		{
			Name: 'Claim',
			Fields: null,
			Disabled: false,
   onSelect: async (targetID, reason = "") => { await QueueRPCActions(targetID, false, reason, RPCAction.Claim) }
		},
		{
			Name: 'Unclaim',
			Fields: [{ Name: "Reason", Answer: "", Validate: () => { return true } }],
			Disabled: true,
   onSelect: async (targetID, reason) => { await QueueRPCActions(targetID, false, reason, RPCAction.Unclaim) }
		},
		{
			Name: 'Approve',
			Fields: [{ Name: "Reason", Answer: "", Validate: () => { return true } }],
			Disabled: true,
   onSelect: async (targetID, reason) => { await QueueRPCActions(targetID, false, reason, RPCAction.Approve) }
		},
		{
			Name: 'Deny',
			Fields: [{ Name: "Reason", Answer: "", Validate: () => { return true } }],
			Disabled: true,
   onSelect: async (targetID, reason) => { await QueueRPCActions(targetID, false, reason, RPCAction.Deny) }
		}
	];
</script>

{#await fetchQueueBots()}
	<Loading msg={'Fetching bots in queue...'} />
{:then bots}
	<div class="mt-10">
		<h2 class="text-2xl font-bold">Bot Queue</h2>

		<div class="p-3" />

		<Column>
			{#each bots as bot, i}
				<Card>
					<span slot="avatar">
						<img class="rounded-full w-10 h-10" src={bot?.user?.avatar} alt="Bot Avatar" />
					</span>

					<span slot="display-name">{bot?.user?.username}</span>

					<span slot="short">{bot?.short}</span>
					<span slot="post-slot" class="block mt-5 text-md tracking-tight my-2">
						<div class="mt-3 rounded-lg bg-black/80 p-3 text-white">
							<span class="font-extrabold">#{i + 1}</span>
							{bot?.claimed_by ? `Claimed by ${bot?.claimed_by}` : ''}
							{bot?.claimed_by === null ? 'Pending Review' : ''}
						</div>

						<div class="flex justify-evenly items-center">
							<CardLinkButton
								target="_blank"
								link={`${$panelState?.coreConstants?.frontend_url}/bots/${bot?.bot_id}`}
								showArrow={false}>View</CardLinkButton
							>

							<CardLinkButton
								target="_blank"
								link={`https://discord.com/api/v10/oauth2/authorize?client_id=${bot?.client_id}&permissions=0&scope=bot%20applications.commands&guild_id=${$panelState?.coreConstants?.servers?.testing}`}
								showArrow={false}
								seperate={true}>Invite</CardLinkButton
							>
						</div>

						<QueueActions fullButton={true} {Actions}>Actions</QueueActions>
					</span>
				</Card>
			{/each}
		</Column>
	</div>
{:catch err}
	<Error msg={`Failed to fetch bots in queue: ${err}`} />
{/await}
