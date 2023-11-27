<script lang="ts">
	import logger from '$lib/logger';
	import { panelState } from '$lib/panelState';
	import AuthBoundary from '../../components/AuthBoundary.svelte';
	import ListItem from '../../components/ListItem.svelte';
	import UnorderedList from '../../components/UnorderedList.svelte';
	import InfoPane from '../../components/pane/InfoPane.svelte';
	import PaneContent from '../../components/pane/PaneContent.svelte';
	import PaneWrapper from '../../components/pane/PaneWrapper.svelte';
	import type { QuickAction } from './_core/QuickAction';
	import QuickMenuOption from './_core/QuickMenuOption.svelte';

	let quickActions: QuickAction[] = [
		{
			name: 'Index',
			description: 'Index Page',
			link: '/panel',
			enabled: () => {
				logger.info("QuickAction", $panelState)
				return true
			}
		},
		{
			name: 'Bot Queue',
			description: 'View the bot queue',
			link: '/panel/bots/queue',
			enabled: () => $panelState?.capabilities?.includes('ViewBotQueue') || false
		},
		{
			name: 'CDN',
			description: 'Manage the CDN(s) modifiable by this Arcadia instance',
			link: '/panel/cdn',
			enabled: () => $panelState?.capabilities?.includes('CdnManagement') || false
		},
		{
			name: 'Partners',
			description: 'Manage the partners on the list',
			link: '/panel/partners',
			enabled: () => $panelState?.capabilities?.includes('PartnerManagement') || false
		},
		{
			name: "Changelogs",
			description: "Manage the changelogs for the list",
			link: "/panel/changelogs",
			enabled: () => $panelState?.capabilities?.includes("ChangelogManagement") || false
		},
		{
			name: "Blog",
			description: "Manage the blog posts for the list",
			link: "/panel/blog",
			enabled: () => $panelState?.capabilities?.includes("BlogManagement") || false
		},
		{
			name: "Applications",
			description: "Manage the applications for the list",
			link: "/panel/apps",
			enabled: () => false // Does not work yet
			//enabled: () => $panelState?.capabilities?.includes("ViewApps") || false
		},
		{
			name: 'RPC Actions',
			description: 'Manage entities!',
			link: '/panel/rpc',
			enabled: () => $panelState?.capabilities?.includes('Rpc') || false,
			options: () => ($panelState?.rpcSupportedTargetTypes || []).map((type) => {
				return {
					name: type,
					description: `Manage ${type}s!`,
					link: `/panel/rpc/${type}`
				};
			})
		},
		{
			name: 'Settings',
			description: 'Customize your experience!',
			link: '/panel/settings',
			enabled: () => true
		}
	];

	let perms: String[] = [];

	$: {
		perms = [];

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
					{#if action.enabled()}
						<QuickMenuOption {index} {action} actionsLength={quickActions.length} />
					{/if}
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