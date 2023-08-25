<script lang="ts">
	import { panelAuthState } from "$lib/panelAuthState";
	import Loading from "../../../../components/Loading.svelte";
    import Error from "../../../../components/Error.svelte";
	import type { PanelQuery } from "../../../../utils/generated/arcadia/PanelQuery";
	import type { QueueBot } from "../../../../utils/generated/arcadia/QueueBot";
	import Card from "../../../../components/Card.svelte";
	import GreyText from "../../../../components/GreyText.svelte";
	import FlexedArea from "../../../../components/FlexedArea.svelte";
	import ButtonLink from "../../../../components/ButtonLink.svelte";
	import { panelState } from "$lib/panelData";
	import UnorderedList from "../../../../components/UnorderedList.svelte";
	import ListItem from "../../../../components/ListItem.svelte";
    
    const fetchQueueBots = async () => {
        let lp: PanelQuery = {
            BotQueue: {
                login_token: $panelAuthState?.loginToken || ''
            }
        }
        let res = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(lp)
        })
        let bots: QueueBot[] = await res.json()

        return bots
    }
</script>

{#await fetchQueueBots()}
    <Loading msg={"Fetching bots in queue..."} />    
{:then bots}
    <FlexedArea>
        {#each bots as bot, i}
            <Card title={`#${i+1}: ${bot?.user?.username}`}>
                <GreyText>{bot?.short}</GreyText>
                <span slot="post-slot" class="block mt-5 text-xl font-bold text-black tracking-tight my-2">
                    <h3 class="text-2xl font-bold tracking-tight">Bot Info</h3>
                    <UnorderedList>
                        {#if bot?.claimed_by}
                            <ListItem><span class="font-semibold">Claimed By: </span>{bot?.claimed_by}</ListItem>
                        {:else}
                            <ListItem><span class="font-semibold">Bot Pending Review</span></ListItem>
                        {/if}
                    </UnorderedList>

                    <div class="flex flex-wrap justify-evenly items-center">
                        <ButtonLink target="_blank" link={`${$panelState?.coreConstants?.frontend_url}/bots/${bot?.bot_id}`}>View</ButtonLink>
                        <ButtonLink target="_blank" link={`https://discord.com/api/v10/oauth2/authorize?client_id=${bot?.client_id}&permissions=0&scope=bot%20applications.commands&guild_id=${$panelState?.coreConstants?.servers?.testing}`}>Invite</ButtonLink>
                    </div>
                    <!--
                        {#if bot?.claimed_by}
                        {/if}
                    -->
                </span>
            </Card>    
        {/each}
    </FlexedArea>
{:catch err} 
    <Error msg={`Failed to fetch bots in queue: ${err}`} />
{/await}