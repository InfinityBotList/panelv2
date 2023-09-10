<script lang="ts">
	import { panelAuthState } from '$lib/panelAuthState';
	import Loading from '../../../../components/Loading.svelte';
	import ErrorComponent from '../../../../components/Error.svelte';
	import type { PanelQuery } from '../../../../utils/generated/arcadia/PanelQuery';
	import type { SearchBot } from '../../../../utils/generated/arcadia/SearchBot';
	import Card from '../../../../components/Card.svelte';
	import { panelState } from '$lib/panelData';
	import CardLinkButton from '../../../../components/CardLinkButton.svelte';
	import Column from '../../../../components/Column.svelte';
	import { fetchClient } from '$lib/fetch';
	import type { RPCWebAction } from '../../../../utils/generated/arcadia/RPCWebAction';
	import ManageAction from './ManageAction.svelte';
	import { error } from '$lib/toast';
	import ButtonReact from '../../../../components/button/ButtonReact.svelte';
	import { Color } from '../../../../components/button/colors';
	import InputText from '../../../../components/inputs/InputText.svelte';
	import { title } from '$lib/strings';

	const fetchRpcMethods = async () => {
		let lp = {
			GetRpcMethods: {
				login_token: $panelAuthState?.loginToken || '',
				filtered: true
			}
		};

		let actionsRes = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});

		if (!actionsRes.ok) throw new Error('Failed to fetch actions');

		let actions: RPCWebAction[] = await actionsRes.json();

		return {
			actions
		};
	};

	let searchQuery = '';
	let searchResults: SearchBot[] = [];

	const fetchSearchBots = async () => {
		if (!searchQuery) {
			error('Please enter a search query');
			return false;
		}

		let lp: PanelQuery = {
			SearchBots: {
				login_token: $panelAuthState?.loginToken || '',
				query: searchQuery
			}
		};

		let res = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});

		if (!res.ok) throw new Error('Failed to fetch bots in queue');

		let bots: SearchBot[] = await res.json();

		if (bots?.length == 0) {
			error('Could not find bots matching this query');
			searchResults = [];
			return false;
		}

		searchResults = bots;

		return true;
	};

	const getBotType = (bot: SearchBot) => {
		switch (bot?.type) {
			case 'claimed':
				return `Claimed by ${bot?.claimed_by}`;
			default:
				return title(bot?.type);
		}
	};
</script>

{#await fetchRpcMethods()}
	<Loading msg={'Fetching available actions...'} />
{:then meta}
	<div class="mt-10">
		<h2 class="text-2xl font-bold">Bot Management</h2>

		<InputText
			id="search"
			label="Search for a bot?"
			minlength={0}
			showErrors={false}
			bind:value={searchQuery}
			placeholder="Search for a bot to manage"
		/>

		<ButtonReact
			color={Color.Themable}
			icon="mdi:search"
			states={{
				loading: 'Searching...',
				success: 'Searched!',
				error: 'Search failed!'
			}}
			onClick={fetchSearchBots}
			text="Search"
		/>

		<div class="p-3" />

		{#if searchResults}
			<Column>
				{#each searchResults as bot, i}
					<Card>
						<span slot="avatar">
							<img class="rounded-full w-10 h-10" src={bot?.user?.avatar} alt="Bot Avatar" />
						</span>

						<span slot="display-name">{bot?.user?.username}</span>

						<span slot="short">{bot?.short}</span>
						<span slot="post-slot" class="block mt-5 text-md tracking-tight my-2">
							<div class="mt-3 rounded-lg bg-black/80 p-3 text-white">
								<span class="font-extrabold">#{i + 1}</span>
								{getBotType(bot)}
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

							<ManageAction {bot} actions={meta?.actions} />
						</span>
					</Card>
				{/each}
			</Column>
		{:else}
			<p class="font-semibold text-xl text-red-500">
				There are no bots matching your query! Try making another search?
			</p>
		{/if}
	</div>
{:catch err}
	<ErrorComponent msg={`Failed to fetch bots: ${err}`} />
{/await}
