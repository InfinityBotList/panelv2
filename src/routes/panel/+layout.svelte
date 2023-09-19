<script lang="ts">
	import { panelState } from '$lib/panelData';
	import AuthBoundary from '../../components/AuthBoundary.svelte';
	import ListItem from '../../components/ListItem.svelte';
	import UnorderedList from '../../components/UnorderedList.svelte';
	import InfoPane from '../../components/pane/InfoPane.svelte';
	import PaneContent from '../../components/pane/PaneContent.svelte';
	import PaneWrapper from '../../components/pane/PaneWrapper.svelte';
	import type { QuickAction } from './_core/QuickAction';
	import QuickMenuOption from './_core/QuickMenuOption.svelte';

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
				case 'CdnManagement':
					quickActions.push({
						name: 'Manage CDN',
						description: 'Manage the CDN(s) modifiable by this Arcadia instance',
						link: '/panel/cdn'
					});
					break;
				case 'PartnerManagement':
					quickActions.push({
						name: 'Manage Partners',
						description: 'Manage the partners on the list',
						link: '/panel/partners'
					});
					break;
				case 'Rpc':
					quickActions.push({
						name: 'RPC Actions',
						description: 'Manage entities!',
						link: '/panel/rpc',
						options: ($panelState?.rpcSupportedTargetTypes || []).map((type) => {
							return {
								name: type,
								description: `Manage ${type}s!`,
								link: `/panel/rpc/${type}`
							};
						})
					});
					break;
			}
		}

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
					<QuickMenuOption {index} {action} actionsLength={quickActions.length} />
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
			<div class="block mt-14">
				<slot />
			</div>
		</PaneContent>
	</PaneWrapper>
</AuthBoundary>
