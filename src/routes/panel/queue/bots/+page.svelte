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

						<button
							class="flex justify-center hover:opacity-75 focus:outline-none mt-3 w-full rounded-lg bg-black/90 p-3 text-center text-white"
							on:click={() => {
								showActionsModal = true;
							}}
						>
							Actions

							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="w-6 h-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
								/>
							</svg>
						</button>

						{#if showActionsModal}
							<Modal bind:showModal={showActionsModal}>
								<h1 slot="header" class="font-semibold text-2xl">Perform RPC Action</h1>
								<RPC 
									actions={bots.actions?.filter((a) => {
										if(bot?.claimed_by) return ["Unclaim", "Approve", "Deny"].includes(a.id)
										else return a.id == "Claim"
									})} 
									targetType={"Bot"} 
									initialData={{
										target_id: bot?.bot_id,
									}} 
								/>
									{#if !bot?.claimed_by}
										<p class="text-red-500">You must claim this bot in order to review it</p>
									{/if}
							</Modal>	
						{/if}					
					</span>
				</Card>
			{/each}
		</Column>
	</div>
{:catch err}
	<ErrorComponent msg={`Failed to fetch bots in queue: ${err}`} />
{/await}
