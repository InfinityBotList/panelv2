<script lang="ts">
	import { panelState } from '$lib/panelData';
</script>

<div class="mt-14">
			<h1 class="text-3xl font-semibold">
				Welcome Back, {$panelState?.userDetails?.display_name}!
			</h1>

            <p>Pretty empty right now, isn't it?</p>

		<!--<InfoPane title="Permissions" description="Your Permissions?">
			<PaneData>
				<UnorderedList>
					{#if $panelState?.userPerms?.owner}
						<ListItem>Owner (owner)</ListItem>
					{/if}

					{#if $panelState?.userPerms?.hadmin}
						<ListItem>Head Staff Manager (hadmin)</ListItem>
					{/if}

					{#if $panelState?.userPerms?.admin}
						<ListItem>Staff Manager (admin)</ListItem>
					{/if}

					{#if $panelState?.userPerms?.iblhdev}
						<ListItem>Head Developer (iblhdev)</ListItem>
					{/if}

					{#if $panelState?.userPerms?.ibldev}
						<ListItem>Developer (ibldev)</ListItem>
					{/if}

					{#if $panelState?.userPerms?.staff}
						<ListItem>Staff (staff)</ListItem>
					{/if}
				</UnorderedList>
			</PaneData>
		</InfoPane>-->
</div>
