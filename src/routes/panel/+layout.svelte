<script lang="ts">
	import logger from '$lib/logger';
	import { panelState } from '$lib/panelState';
	import { build, hasPerm } from '$lib/perms';
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
			enabled: () => true, // This is always available
		},
		{
			name: 'CDN',
			description: 'Manage the CDN(s) modifiable by this Arcadia instance',
			link: '/panel/cdn',
			enabled: () => hasPerm($panelState?.userPerms?.resolved_perms || [], build("cdn", "list_scopes"))
		},
		{
			name: 'Partners',
			description: 'View and/or manage the partners on the list',
			link: '/panel/partners',
			enabled: () => true // All staff can view the partner list, other permissions are handled by admin panel code
		},
		{
			name: "Changelogs",
			description: "View and/or manage the changelogs for the list",
			link: "/panel/changelogs",
			enabled: () => true // All staff can view the changelog entry list, other permissions are handled by admin panel code
		},
		{
			name: "Blog",
			description: "Manage the blog posts for the list",
			link: "/panel/blog",
			enabled: () => true // All staff can view the blog post list, other permissions are handled by admin panel code
		},
		{
			name: "Applications",
			description: "Manage the applications for the list",
			link: "/panel/apps",
			enabled: () => hasPerm($panelState?.userPerms?.resolved_perms || [], build("apps", "view"))
		},
		{
			name: 'RPC Actions',
			description: 'Manage entities!',
			link: '/panel/rpc',
			enabled: () => true,
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
		},
		{
			name: "Staff Management",
			description: "View and manage staff positions and permissions",
			link: "/panel/staff",
			enabled: () => true
		},
		{
			name: 'Logout',
			description: 'Logout from the panel',
			link: '/panel/logout',
			enabled: () => true
		},
	];
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
				{#each ($panelState?.userPerms?.resolved_perms || []) as perm}
					{#if perm.startsWith("~")}
						<ListItem className="text-red-600 line-through">{perm}</ListItem>
					{:else if perm.endsWith(".*")}
						<ListItem className="text-green-600 font-bold">{perm}</ListItem>
					{:else}
						<ListItem>{perm}</ListItem>
					{/if}
				{/each}
			</UnorderedList>
		</InfoPane>

		<PaneContent>
			<div class="block mt-14">
				<p>
					{$panelState?.hello?.description}
				</p>
				{#if $panelState?.hello?.warnings}
					<div class="text-yellow-500 rounded-lg">
						{#each $panelState.hello.warnings as warning}
							<p>{warning}</p>
						{/each}
					</div>
				{/if}
				<hr class="my-4" />
				<slot />
			</div>
		</PaneContent>
	</PaneWrapper>
</AuthBoundary>
