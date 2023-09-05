<script lang="ts">
	import { panelAuthState } from '$lib/panelAuthState';
	import Loading from '../../../../components/Loading.svelte';
	import ErrorComponent from '../../../../components/Error.svelte';
	import type { PanelQuery } from '../../../../utils/generated/arcadia/PanelQuery';
	import type { QueueBot } from '../../../../utils/generated/arcadia/QueueBot';
	import Card from '../../../../components/Card.svelte';
	import { panelState } from '$lib/panelData';
	import CardLinkButton from '../../../../components/CardLinkButton.svelte';
	import Column from '../../../../components/Column.svelte';
	import { fetchClient } from '$lib/fetch';
	import RPC from '../../../../components/rpc/RPC.svelte';
	import type { RPCWebAction } from '../../../../utils/generated/arcadia/RPCWebAction';
	import Modal from '../../../../components/Modal.svelte';
	import QueueAction from './QueueAction.svelte';

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

		if(!res.ok) throw new Error('Failed to fetch bots in queue');

		let bots: QueueBot[] = await res.json();

		lp = {
			GetRpcMethods: {
				login_token: $panelAuthState?.loginToken || '',
				filtered: true
			}
		}

		let actionsRes = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});

		if(!actionsRes.ok) throw new Error('Failed to fetch actions');

		let actions: RPCWebAction[] = await actionsRes.json();

		return {
			bots,
			actions
		};
	};

	let showActionsModal = false;
</script>

{#await fetchQueueBots()}
	<Loading msg={'Fetching bots in queue...'} />
{:then bots}
	<div class="mt-10">
		<h2 class="text-2xl font-bold">Bot Queue</h2>

		<div class="p-3" />

		<Column>
			{#each bots.bots as bot, i}
				<Card>
					<span slot="avatar">
						<img class="rounded-full w-10 h-10" src={bot?.user?.avatar} alt="Bot Avatar" />
					</span>

					<span slot="display-name">{bot?.user?.username}</span>

					<span slot="short">{bot?.short}</span>
					<span slot="post-slot" class="block mt-5 text-md tracking-tight my-2">
						<div class="mt-3 rounded-lg bg-black/80 p-3 text-white">
							<span class="font-extrabold">#{i + 1}</span>
							{bot?.claimed_by ? `Claimed by ${bot?.claimed_by}` : 'Pending Review'}
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
						
						<QueueAction bot={bot} actions={bots.actions} />
					</span>
				</Card>
			{/each}
		</Column>
	</div>
{:catch err}
	<ErrorComponent msg={`Failed to fetch bots in queue: ${err}`} />
{/await}
