<script lang="ts">
	import { panelState } from "$lib/panelData";
	import ListItem from "../../components/ListItem.svelte";
	import UnorderedList from "../../components/UnorderedList.svelte";
	import InfoPane from "../../components/pane/InfoPane.svelte";
	import PaneContent from "../../components/pane/PaneContent.svelte";
	import PaneData from "../../components/pane/PaneData.svelte";
	import PaneWrapper from "../../components/pane/PaneWrapper.svelte";
</script>

<PaneWrapper>
    <InfoPane title="Permissions" description="Your Permissions?">
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
    </InfoPane>

    <PaneContent>
        <h1 class="text-3xl font-semibold">Hey there {$panelState?.userDetails?.display_name} ({$panelState?.userDetails?.username})</h1>
    </PaneContent>
</PaneWrapper>