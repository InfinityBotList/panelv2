<script lang="ts">
	import { goto } from '$app/navigation';
	import { panelState } from '$lib/panelData';
	import AuthBoundary from '../../components/AuthBoundary.svelte';
	import ListItem from '../../components/ListItem.svelte';
	import UnorderedList from '../../components/UnorderedList.svelte';
	import InfoPane from '../../components/pane/InfoPane.svelte';
	import PaneContent from '../../components/pane/PaneContent.svelte';
	import PaneWrapper from '../../components/pane/PaneWrapper.svelte';

	interface QuickAction {
		name: string;
		description: string;
		link: string;
	}

	let quickActions: QuickAction[] = [];

	let perms: String[] = [];

	$: {
		quickActions = [];
		perms = [];

		quickActions.push({
			name: 'Index',
			description: 'Index Page',
			link: '/panel'
		});

		for (let cap of $panelState?.capabilities || []) {
			switch (cap) {
				case 'ViewBotQueue':
					quickActions.push({
						name: 'Bot Queue',
						description: 'View the bot queue',
						link: '/panel/bots/queue'
					});
					break;
				case 'BotManagement':
					quickActions.push({
						name: 'Bot Management',
						description: 'Manage the bots on the list',
						link: '/panel/bots/manage'
					});
					break;
				case 'ManagePartners':
					quickActions.push({
						name: 'Manage Partners',
						description: 'Manage the partners on the list',
						link: '/panel/partners/manage'
					});
					break;
			}
		}

		quickActions.push({
			name: 'RPC Actions',
			description: 'Manage bots!',
			link: '/panel/rpc'
		});

		quickActions.push({
			name: 'Settings',
			description: 'Customize your experience!',
			link: '/panel/settings'
		});

		if ($panelState?.userPerms?.owner) perms.push('Owner');
		if ($panelState?.userPerms?.hadmin) perms.push('Head Staff Manager');
		if ($panelState?.userPerms?.admin) perms.push('Staff Manager');
		if ($panelState?.userPerms?.iblhdev) perms.push('Head Developer');
		if ($panelState?.userPerms?.ibldev) perms.push('Developer');
		if ($panelState?.userPerms?.staff) perms.push('Staff');
	}
</script>

<AuthBoundary>
	<PaneWrapper>
		<InfoPane title="Navigation" description="Welcome to the panel">
			<div>
				{#each quickActions as action, index}
					<button
						class="w-full border border-themable-700/50 p-3 text-xl bg-black hover:bg-slate-800 {index ===
						0
							? 'rounded-t-md'
							: ''} {index === quickActions.length - 1 ? 'rounded-b-md' : ''}"
						on:click={() => goto(action.link)}
					>
						{action.name}
						<small class="text-sm text-gray-400 block">{action.description}</small>
					</button>
				{/each}
			</div>

			<div class="mt-4" />

			<span class="font-semibold">Permissions:</span>
			<UnorderedList>
				{#each perms as perm}
					<ListItem>{perm}</ListItem>
				{/each}
			</UnorderedList>
		</InfoPane>

		<PaneContent>
			<div class="block">
				<slot />
			</div>
		</PaneContent>
	</PaneWrapper>
</AuthBoundary>
