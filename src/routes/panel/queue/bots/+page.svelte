<script lang="ts">
	import { panelAuthState } from '$lib/panelAuthState';
	import Loading from '../../../../components/Loading.svelte';
	import Error from '../../../../components/Error.svelte';
	import type { PanelQuery } from '../../../../utils/generated/arcadia/PanelQuery';
	import type { QueueBot } from '../../../../utils/generated/arcadia/QueueBot';
	import Card from '../../../../components/Card.svelte';
	import { panelState } from '$lib/panelData';
	import UnorderedList from '../../../../components/UnorderedList.svelte';
	import ListItem from '../../../../components/ListItem.svelte';
	import CardLinkButton from '../../../../components/CardLinkButton.svelte';
	import Column from '../../../../components/Column.svelte';

	const fetchQueueBots = async () => {
		let lp: PanelQuery = {
			BotQueue: {
				login_token: $panelAuthState?.loginToken || ''
			}
		};
		let res = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});
		let bots: QueueBot[] = await res.json();

		return bots;
	};
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
						<!--<h3 class="text-2xl font-bold tracking-tight">Bot Info</h3>
						<UnorderedList>
							{#if bot?.claimed_by}
								<ListItem><span class="font-semibold">Claimed By: </span>{bot?.claimed_by}</ListItem
								>
							{:else}
								<ListItem><span class="font-semibold">Bot Pending Review</span></ListItem>
							{/if}
						</UnorderedList>-->

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
					</span>
				</Card>
			{/each}
		</Column>
	</div>
{:catch err}
	<Error msg={`Failed to fetch bots in queue: ${err}`} />
{/await}
