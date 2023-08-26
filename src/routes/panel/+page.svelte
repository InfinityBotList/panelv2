<script lang="ts">
	import { panelState } from '$lib/panelData';
	import ButtonLink from '../../components/ButtonLink.svelte';
	import GreyText from '../../components/GreyText.svelte';
	import PaneContent from '../../components/pane/PaneContent.svelte';
	import PaneWrapper from '../../components/pane/PaneWrapper.svelte';

	interface QuickAction {
		name: string;
		description: string;
		link: string;
	}

	let quickActions: QuickAction[] = [];

	$: {
		for (let cap of $panelState?.capabilities || []) {
			switch (cap) {
				case 'ViewBotQueue':
					quickActions.push({
						name: 'Bot Queue',
						description: 'View the bot queue',
						link: '/panel/queue/bots'
					});
					break;
			}
		}
	}

	let perms: String[] = [];
	if ($panelState?.userPerms?.owner) perms.push('Owner');
	if ($panelState?.userPerms?.hadmin) perms.push('Head Staff Manager');
	if ($panelState?.userPerms?.admin) perms.push('Staff Manager');
	if ($panelState?.userPerms?.iblhdev) perms.push('Head Developer');
	if ($panelState?.userPerms?.ibldev) perms.push('Developer');
	if ($panelState?.userPerms?.staff) perms.push('Staff');
</script>

<div class="mt-14">
	<PaneWrapper>
		<PaneContent>
			<h1 class="text-3xl font-semibold dark:text-white">
				Welcome Back, {$panelState?.userDetails?.display_name}!
			</h1>

			<p class="flex text-black dark:text-white">
				Permissions: {perms.join(', ')}
			</p>

			<fieldset class="mt-4 border border-solid border-gray-300 p-3 rounded-md">
				<legend class="text-xl font-bold dark:text-white">Quick Actions</legend>

				{#each quickActions as action}
					<div class="flex flex-row items-center justify-between">
						<div class="flex flex-col">
							<h2 class="text-lg font-semibold dark:text-white">{action.name}</h2>
							<GreyText>{action.description}</GreyText>
						</div>

						<div class="flex flex-row items-center">
							<ButtonLink link={action.link}>
								{action.name}
							</ButtonLink>
						</div>
					</div>

					<hr class="my-4" />
				{/each}
			</fieldset>
		</PaneContent>
	</PaneWrapper>
</div>
