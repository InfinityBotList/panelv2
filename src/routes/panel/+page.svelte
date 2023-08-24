<script lang="ts">
	import { panelState } from "$lib/panelData";
	import ButtonLink from "../../components/ButtonLink.svelte";
	import GreyText from "../../components/GreyText.svelte";
	import ListItem from "../../components/ListItem.svelte";
	import UnorderedList from "../../components/UnorderedList.svelte";
	import InfoPane from "../../components/pane/InfoPane.svelte";
	import PaneContent from "../../components/pane/PaneContent.svelte";
	import PaneData from "../../components/pane/PaneData.svelte";
	import PaneWrapper from "../../components/pane/PaneWrapper.svelte";

    interface QuickAction {
        name: string;
        description: string;
        link: string;
    }

    let quickActions: QuickAction[] = []

    $: {
        for(let cap of ($panelState?.capabilities || [])) {
            switch (cap) {
                case "ViewBotQueue":
                    quickActions.push({
                        name: "Bot Queue",
                        description: "View the bot queue",
                        link: "/queue/bots"
                    })
                    break;
            }
        }
    }
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

        <h2 class="text-2xl font-semibold mt-24">Quick Actions</h2>

        <div class="mt-4">
            {#each quickActions as action}
                <div class="flex flex-row items-center justify-between">
                    <div class="flex flex-col">
                        <h2 class="text-lg font-semibold">{action.name}</h2>
                        <GreyText>{action.description}</GreyText>
                    </div>
                    <div class="flex flex-row items-center">
                        <ButtonLink
                            link={action.link}
                        >
                            {action.name}
                        </ButtonLink>
                    </div>
                </div>
                <hr class="my-4" />
            {/each}    
        </div>
    </PaneContent>
</PaneWrapper>