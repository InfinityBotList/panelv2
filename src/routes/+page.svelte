<script lang="ts">
	import { panelState } from "$lib/panelData";
	import ListItem from "../components/ListItem.svelte";
	import UnorderedList from "../components/UnorderedList.svelte";
</script>
<h1 class="text-3xl font-semibold">Hey there {$panelState?.userDetails?.display_name} ({$panelState?.userDetails?.username})</h1>

<h2 class="text-xl font-semibold">Permissions</h2>

<p>
    Currently you have the following permissions

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
</p>