<script lang="ts">
	import StepProgress from '../../../../components/StepProgress.svelte';
	import { panelAuthState } from '$lib/panelAuthState';
	import Loading from '../../../../components/Loading.svelte';
	import ErrorComponent from '../../../../components/Error.svelte';
	import type { SearchBot } from '$lib/generated/arcadia/SearchBot';
	import { error } from '$lib/toast';
	import { panelQuery } from '$lib/fetch';
	import type { RPCWebAction } from '$lib/generated/arcadia/RPCWebAction';
	import Column from '../../../../components/Column.svelte';
	import Card from '../../../../components/Card.svelte';
	import CardLinkButton from '../../../../components/CardLinkButton.svelte';
	import { panelState } from '$lib/panelState';
	import { title } from '$lib/strings';
	import Select from './Select.svelte';
	import type { QueueBot } from '$lib/generated/arcadia/QueueBot';
	import Modal from '../../../../components/Modal.svelte';
	import RPC from '../../../../components/rpc/RPC.svelte';
	import { page } from '$app/stores';
	import type { TargetType } from '$lib/generated/arcadia/TargetType';
	import { afterNavigate } from '$app/navigation';

	let query: string;
	let botData: SearchBot | null = null;
	let results: SearchBot[] = [];

	let Steps = [
		{
			Name: 'Find',
			Current: true,
			Completed: false,
			AllowBack: true,
			Validate: () => {
				if (botData) return true;
				else return false;
			}
		},
		{
			Name: 'Confirm',
			Current: false,
			Completed: false,
			AllowBack: true,
			Validate: () => {
				return true;
			}
		},
		{
			Name: 'Action',
			Current: false,
			Completed: true,
			AllowBack: false,
			Validate: () => {
				return true;
			}
		}
	];

	let currentStep: number = 0;
	let modalVisible: boolean = true;

	const fetchRpcMethods = async () => {
		let actionsRes = await panelQuery({
			GetRpcMethods: {
				login_token: $panelAuthState?.loginToken || '',
				filtered: true
			}
		});

		if (!actionsRes.ok) throw new Error('Failed to fetch actions');

		let actions: RPCWebAction[] = await actionsRes.json();

		return {
			actions
		};
	};

	const searchEntity = async () => {
		let targetType = $page.params.targetType?.toString();

		if (!$panelState?.rpcSupportedTargetTypes?.includes(targetType as TargetType)) {
			error('This target type is not supported!');
			return false;
		}

		if (!query) {
			error('Please enter a search query');
			return false;
		}

		let res = await panelQuery({
			SearchEntitys: {
				login_token: $panelAuthState?.loginToken || '',
				query: query,
				target_type: targetType as TargetType
			}
		});

		if (!res.ok) {
			let err = await res.text();

			error(err || 'Unknown error while fetching');
		}

		let bots: SearchBot[] = await res.json();

		if (bots?.length == 0) {
			error('Could not find bots matching this query');
			results = [];
			return false;
		}

		results = bots;

		return true;
	};

	const getType = (bot: SearchBot) => {
		switch (bot?.type) {
			case 'claimed':
				return `Claimed by ${bot?.claimed_by}`;
			default:
				return title(bot?.type);
		}
	};

	afterNavigate(() => {
		query = '';
		results = [];
		botData = null;
	});
</script>

{#await fetchRpcMethods()}
	<Loading msg={'Fetching available actions...'} />
{:then meta}
	{#key currentStep}
		<StepProgress bind:steps={Steps} bind:currentStep>
			{#if currentStep == 0 || !botData}
				<h2 class="text-white dark:text-gray-400 font-black text-xl">Let's get started!</h2>
				<p class="text-base text-white dark:text-gray-400 font-bold">
					Let's find what {$page?.params?.targetType?.toLowerCase()} you are taking action on!
				</p>

				<div class="p-2" />

				<div id="findEntity">
					<label for="searchBar" class="mb-2 text-sm font-medium text-white sr-only"
						>Let's find what {$page?.params?.targetType?.toLowerCase()} you are taking action on!</label
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
							on:keydown={(e) => {
								if (e.key == 'Enter') {
									try {
										searchEntity();
									} catch (err) {
										error(err?.toString() || `Unknown error: ${e}`);
									}
								}
							}}
							id="searchBar"
							name="searchBar"
							class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-slbg focus:border-slbg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slbg dark:focus:border-slbg"
							placeholder="What are you searching for?"
						/>

						<button
							type="submit"
							class="absolute right-2.5 top-2 bottom-2.5 bg-themable-500 text-themable-100 focus:ring-4 focus:outline-none focus:ring-themable-400 rounded-lg px-4"
							on:click={searchEntity}>Search</button
						>
					</div>

					{#if results}
						<div class="p-3" />

						<Column>
							{#each results as bot, i}
								<Card>
									<img slot="image" src={bot?.user?.avatar} alt="" />
									<svelte:fragment slot="display-name">{bot?.user?.username}</svelte:fragment>
									<svelte:fragment slot="short">{bot?.short}</svelte:fragment>
									<svelte:fragment slot="index">#{i + 1}</svelte:fragment>
									<svelte:fragment slot="type">{getType(bot)}</svelte:fragment>
									<svelte:fragment slot="actionA">
										<CardLinkButton
											target="_blank"
											link={`${$panelState?.coreConstants?.frontend_url}/bots/${bot?.bot_id}`}
											showArrow={false}>View</CardLinkButton
										>
									</svelte:fragment>
									<svelte:fragment slot="actionB">
										{#if $page?.params?.targetType == 'Bot'}
											<CardLinkButton
												target="_blank"
												link={`https://discord.com/api/v10/oauth2/authorize?client_id=${bot?.client_id}&permissions=0&scope=bot%20applications.commands&guild_id=${$panelState?.coreConstants?.servers?.testing}`}
												showArrow={false}>Invite</CardLinkButton
											>
										{:else}
											<CardLinkButton target="_blank" link="" disabled={true} showArrow={false}
												>-</CardLinkButton
											>
										{/if}
									</svelte:fragment>
									<svelte:fragment slot="extra">
										<Select {bot} bind:selected={botData} />
									</svelte:fragment>
								</Card>
							{/each}
						</Column>
					{:else}
						<p class="font-semibold text-xl text-red-500">
							There are no bots matching your query! Try making another search?
						</p>
					{/if}
				</div>
			{:else if currentStep == 1 && botData}
				<h2 class="text-white font-black text-xl">
					Alright! Let's make sure we have the right bot in mind!
				</h2>

				<div class="p-3" />

				<Card>
					<img slot="image" src={botData?.user?.avatar} alt="" />
					<svelte:fragment slot="display-name">{botData?.user?.username}</svelte:fragment>
					<svelte:fragment slot="short">{botData?.short}</svelte:fragment>
					<svelte:fragment slot="type"><span class="font-semibold">{getType(botData)}</span></svelte:fragment>
					<svelte:fragment slot="actionA">
						<CardLinkButton
							target="_blank"
							link={`${$panelState?.coreConstants?.frontend_url}/bots/${botData?.bot_id}`}
							showArrow={false}>View</CardLinkButton
						>
					</svelte:fragment>
					<svelte:fragment slot="actionB">
						{#if $page?.params?.targetType == 'Bot'}
							<CardLinkButton
								target="_blank"
								link={`https://discord.com/api/v10/oauth2/authorize?client_id=${botData?.client_id}&permissions=0&scope=bot%20applications.commands&guild_id=${$panelState?.coreConstants?.servers?.testing}`}
								showArrow={false}>Invite</CardLinkButton
							>
						{:else}
							<CardLinkButton target="_blank" link="" disabled={true} showArrow={false}
								>-</CardLinkButton
							>
						{/if}
					</svelte:fragment>
				</Card>
			{:else if currentStep == 2}
				<h2 class="text-white font-black text-xl">Ready, set, action!</h2>

				{#if modalVisible}
					<Modal bind:showModal={modalVisible}>
						<h1 slot="header" class="font-semibold text-2xl">Perform RPC Action</h1>

						<RPC
							actions={meta?.actions}
							targetType={'Bot'}
							initialData={{
								target_id: botData?.bot_id
							}}
						/>
					</Modal>
				{:else}
					<h2 class="text-white font-black text-base">
						You have completed this RPC Action! If you would like to perform another one, click the
						button down below.
					</h2>

					<button
						class="ml-2 bg-themable-600 text-lg px-4 text-themable-100 p-2 border-none rounded-md focus:ring-4 focus:outline-none focus:ring-themable-400"
						on:click={() => {
							currentStep = 0;
							modalVisible = true;
						}}>Perform Another!</button
					>
				{/if}
			{/if}
		</StepProgress>
	{/key}
{:catch err}
	<ErrorComponent msg={`Failed to fetch bots: ${err}`} />
{/await}
