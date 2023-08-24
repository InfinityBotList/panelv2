<script lang="ts">
	import { panelState } from "$lib/panelData";
	import ButtonLink from "../../components/ButtonLink.svelte";
	import GreyText from "../../components/GreyText.svelte";

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
                        link: "/panel/queue/bots"
                    })
                    break;
            }
        }
    }
</script>

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
