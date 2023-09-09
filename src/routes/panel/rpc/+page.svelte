<script lang="ts">
	import StepProgress from '../../../components/StepProgress.svelte';
	import { panelAuthState } from '$lib/panelAuthState';
	import Loading from '../../../components/Loading.svelte';
	import ErrorComponent from '../../../components/Error.svelte';
	import type { PanelQuery } from '../../../utils/generated/arcadia/PanelQuery';
	import type { SearchBot } from '../../../utils/generated/arcadia/SearchBot';
	import { error } from '$lib/toast';
	import { fetchClient } from '$lib/fetch';
	import type { RPCWebAction } from '../../../utils/generated/arcadia/RPCWebAction';
	import Column from '../../../components/Column.svelte';
	import Card from '../../../components/Card.svelte';
	import CardLinkButton from '../../../components/CardLinkButton.svelte';
	import { panelState } from '$lib/panelData';
	import { title } from '$lib/strings';
	import Select from './Select.svelte';
	import type { QueueBot } from '../../../utils/generated/arcadia/QueueBot';
	import Modal from '../../../components/Modal.svelte';
	import RPC from '../../../components/rpc/RPC.svelte';

	let query: string | null = null;
	let botData: QueueBot | null = null;
	let results: SearchBot[] = [];

	let Steps = [
		{
			ID: 0,
			Name: 'Find',
			Current: true,
			Completed: false,
			AllowBack: true,
			Validate: () => {
				if (!botData) return false;
				else return true;
			}
		},
		{
			ID: 1,
			Name: 'Confirm',
			Current: false,
			Completed: false,
			AllowBack: true,
			Validate: () => {
				return true;
			}
		},
		{
			ID: 2,
			Name: 'Advanced',
			Current: false,
			Completed: false,
			AllowBack: false,
			Validate: () => {
				return true;
			}
		}
	];

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

	const fetchSearchBots = async () => {
		if (!query) {
			error('Please enter a search query');
			return false;
		}

		let lp: PanelQuery = {
			SearchBots: {
				login_token: $panelAuthState?.loginToken || '',
				query: query
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
			results = [];
			return false;
		}

		results = bots;

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
		<StepProgress bind:steps={Steps}>
			{#if Steps.findIndex((p) => p.Current) === 0}
				<h2 class="text-black dark:text-gray-400 font-black text-xl">Let's get Started!</h2>
				<p class="text-base text-black dark:text-gray-400 font-bold">
					Let's find what bot you are taking action on!
				</p>

				<div class="p-2" />

				<div id="findBot">
					<label
						for="searchBar"
						class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
						>Let's find what bot you are taking action on!</label
					>

					<div class="relative">
						<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg
								class="w-4 h-4 text-gray-500 dark:text-gray-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 20 20"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
								/>
							</svg>
						</div>

						<input
							type="search"
							bind:value={query}
							id="searchBar"
							class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-slbg focus:border-slbg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slbg dark:focus:border-slbg"
							placeholder="What is the name of the bot?"
						/>

						<button
							type="submit"
							class="absolute right-2.5 bottom-2.5 bg-slbg hover:bg-opacity-75 focus:ring-4 focus:outline-none focus:ring-slbg rounded-lg px-4 py-2 dark:bg-gray-900 dark:hover:bg-opacity-100 dark:focus:ring-gray-900"
							on:click={fetchSearchBots}>Search</button
						>
					</div>

					{#if results}
						<div class="p-3" />

						<Column>
							{#each results as bot, i}
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

										<Select {bot} bind:selected={botData} />
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
			{/if}

			{#if Steps.findIndex((p) => p.Current) === 1}
				<h2 class="text-black dark:text-gray-400 font-black text-xl">
					Alright! Let's make sure we have the right bot in mind!
				</h2>

				<div class="p-3" />

				<Card>
					<span slot="avatar">
						<img class="rounded-full w-10 h-10" src={botData?.user?.avatar} alt="Bot Avatar" />
					</span>

					<span slot="display-name">{botData?.user?.username}</span>

					<span slot="short">{botData?.short}</span>
					<span slot="post-slot" class="block mt-3 text-md tracking-tight my-2">
						<div class="flex justify-evenly items-center">
							<CardLinkButton
								target="_blank"
								link={`${$panelState?.coreConstants?.frontend_url}/bots/${botData?.bot_id}`}
								showArrow={false}>View</CardLinkButton
							>

							<CardLinkButton
								target="_blank"
								link={`https://discord.com/api/v10/oauth2/authorize?client_id=${botData?.client_id}&permissions=0&scope=bot%20applications.commands&guild_id=${$panelState?.coreConstants?.servers?.testing}`}
								showArrow={false}
								seperate={true}>Invite</CardLinkButton
							>
						</div>
					</span>
				</Card>
			{/if}

			{#if Steps.findIndex((p) => p.Current) === 2}
				<h2 class="text-black dark:text-gray-400 font-black text-xl">
					Alright! What action would you like to perform?
				</h2>

				<Modal showModal={true}>
					<h1 slot="header" class="font-semibold text-2xl">Perform RPC Action</h1>

					<RPC
						actions={meta?.actions}
						targetType={'Bot'}
						initialData={{
							target_id: botData?.bot_id
						}}
					/>
				</Modal>
			{/if}

			{#if Steps[Steps.findIndex((p) => p.ID === 2)].Completed === true}
				<h2 class="text-black dark:text-gray-400 font-black text-base">
					You have completed this RPC Action! If you would like to perform another one, click the
					button down below.
				</h2>

				<button
					class="ml-2 bg-green-600 text-base text-white p-2 border-none rounded-md"
					on:click={() => location.reload()}>Perform Another!</button
				>
			{/if}
		</StepProgress>
	</div>
{:catch err}
	<ErrorComponent msg={`Failed to fetch bots: ${err}`} />
{/await}
