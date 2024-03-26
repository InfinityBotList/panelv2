<script lang="ts">
	import '../app.postcss';
	import '$lib/styles/global.css';
	import '$lib/styles/mainsite/customColors.css';
	import '$lib/styles/mainsite/global.css';
    import logger from '$lib/logger';
	import { panelState } from '$lib/panelState';
	import { build, hasPerm } from '$lib/perms';
	import { title } from '$lib/strings';
	import AuthBoundary from '../components/AuthBoundary.svelte';
	import ListItem from '../components/ListItem.svelte';
	import UnorderedList from '../components/UnorderedList.svelte';
	import InfoPane from '../components/pane/InfoPane.svelte';
	import PaneContent from '../components/pane/PaneContent.svelte';
	import PaneWrapper from '../components/pane/PaneWrapper.svelte';
	import PermDisplay from './_core/PermDisplay.svelte';
	import type { QuickAction } from './_core/QuickAction';
	import QuickMenuOption from './_core/QuickMenuOption.svelte';
	import { staffQuickActions } from './staff/quickActions';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import Menubar from '../components/Menubar.svelte';
	import { onMount } from 'svelte';

	const options = {};

	const buildInfo = {
		// @ts-ignore
		nodeEnv: I_NODE_ENV,
		// @ts-ignore
		publicCommit: I_COMMIT,
		// @ts-ignore
		lastMod: I_LAST_MOD,
		// @ts-ignore
		version: I_VERSION
	};

    let quickActions: QuickAction[] = [
		{
			name: 'Index',
			description: 'Index Page',
			link: '/',
			enabled: () => {
				logger.info('QuickAction', $panelState);
				return true;
			}
		},
		{
			name: 'Staff Guide',
			description: 'View our staff guides for guidance on doing stuff!',
			link: '/staffguide',
			enabled: () => {
				logger.info('QuickAction', $panelState);
				return true;
			}
		},
		{
			name: 'Bot Queue',
			description: 'View the bot queue',
			link: '/bots/queue',
			enabled: () => true // This is always available
		},
		{
			name: 'List Management',
			description: 'Manage the list',
			link: '',
			enabled: () => true,
			options: () => {
				return [
					{
						name: 'CDN',
						description: 'Manage the CDN(s) modifiable by this Arcadia instance',
						link: '/cdn',
						enabled: () =>
							hasPerm($panelState?.staff_member?.resolved_perms || [], build('cdn', 'list_scopes'))
					},
					{
						name: 'Partners',
						description: 'View and/or manage the partners on the list',
						link: '/partners',
						enabled: () => true // All staff can view the partner list, other permissions are handled by admin panel code
					},
					{
						name: 'Changelogs',
						description: 'View and/or manage the changelogs for the list',
						link: '/changelogs',
						enabled: () => true // All staff can view the changelog entry list, other permissions are handled by admin panel code
					},
					{
						name: 'Blog',
						description: 'Manage the blog posts for the list',
						link: '/blog',
						enabled: () => true // All staff can view the blog post list, other permissions are handled by admin panel code
					},
					{
						name: 'Applications',
						description: 'Manage the applications for the list',
						link: '/apps',
						enabled: () =>
							hasPerm($panelState?.staff_member?.resolved_perms || [], build('apps', 'view'))
					}
				];
			}
		},
		{
			name: 'RPC Actions',
			description: 'Manage entities!',
			link: '/rpc',
			enabled: () => true,
			options: () =>
				($panelState?.target_types || []).map((type) => {
					return {
						name: type,
						description: `Manage ${type}s!`,
						link: `/rpc/${type}`,
						enabled: () => true
					};
				})
		},
		{
			name: 'Staff Management',
			description: 'View and manage staff',
			enabled: () => true,
			link: '/staff',
			options: () => {
				return staffQuickActions;
			}
		},
		{
			name: 'Settings',
			description: 'Customize your experience!',
			link: '/settings',
			enabled: () => true
		},
		{
			name: 'Logout',
			description: 'Logout from the panel',
			link: '/logout',
			enabled: () => true
		}
	]; // cum

	onMount(async () => {
		const Sentry = await import('@sentry/browser');
		Sentry.init({
			dsn: 'https://8d6d3598571136c2a6c7dcba71ca0363@trace.infinitybots.gg/5',
			tunnel: `https://spider.infinitybots.gg/failure-management?to=br0`,
			replaysSessionSampleRate: 0.3,
			tracesSampleRate: 0.4,
			integrations: [new Sentry.Replay()],
			release: `panelv2@${buildInfo?.version}-${buildInfo?.publicCommit})`
		});
	});
</script>

<div data-theme="violet" class="flex min-h-screen flex-col justify-between overflow-x-hidden">
	<header class="mt-1">
		<Menubar />
	</header>

	<main class="text-white bg-contain">
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
        
                    <details>
                        <summary class="hover:cursor-pointer">View Permissions</summary>
        
                        <div class="p-2" />
        
                        <span class="font-semibold">Staff Positions:</span>
                        <UnorderedList>
                            {#each $panelState?.staff_member?.positions || [] as staffPosition}
                                <ListItem className="ml-3"
                                    >{title(staffPosition.name.replaceAll('_', ' '))}
                                    <span class="opacity-80">({staffPosition.name})</span></ListItem
                                >
                            {/each}
                        </UnorderedList>
        
                        {#if ($panelState?.staff_member?.perm_overrides || []).length > 0}
                            <span class="font-semibold">Permission Overrides:</span>
                            <UnorderedList>
                                {#each $panelState?.staff_member?.perm_overrides || [] as perm}
                                    <PermDisplay {perm} />
                                {/each}
                            </UnorderedList>
                        {/if}
        
                        <span class="font-semibold">Resolved Permissions:</span>
                        <UnorderedList>
                            {#each $panelState?.staff_member?.resolved_perms || [] as perm}
                                <PermDisplay {perm} />
                            {/each}
                        </UnorderedList>
                    </details>
                </InfoPane>
        
                <PaneContent>
                    <div class="block mt-14">
                        <p>
                            {$panelState?.instance_config?.description}
                        </p>
                        {#if $panelState?.instance_config?.warnings}
                            <div class="text-yellow-500 rounded-lg">
                                {#each $panelState.instance_config?.warnings as warning}
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

		<SvelteToast {options} />
	</main>

	<footer class="mb-auto border-white border-t-2">
		<p class="text-center text-white text-md font-semibold">&copy; 2020 Infinity Development</p>
		<small class="text-center text-white text-sm font-semibold">
			{buildInfo?.version}-{buildInfo?.publicCommit}-{buildInfo?.nodeEnv?.substring(0, 4)} ({buildInfo?.lastMod})
		</small>
	</footer>
</div>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
