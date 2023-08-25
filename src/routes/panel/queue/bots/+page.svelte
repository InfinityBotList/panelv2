<script lang="ts">
	import { panelAuthState } from "$lib/panelAuthState";
	import Loading from "../../../../components/Loading.svelte";
    import Error from "../../../../components/Error.svelte";
	import type { PanelQuery } from "../../../../utils/generated/arcadia/PanelQuery";
	import type { QueueBot } from "../../../../utils/generated/arcadia/QueueBot";
	import Card from "../../../../components/Card.svelte";
	import GreyText from "../../../../components/GreyText.svelte";
	import FlexedArea from "../../../../components/FlexedArea.svelte";
    
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
        {#each bots as bot}
            <Card title={bot?.user?.username}>
                <GreyText>{bot?.short}</GreyText>
                <span slot="post-slot" class="block mt-5 text-xl font-bold text-black tracking-tight my-2">
                        hello world
                </span>
            </Card>    
        {/each}
    </FlexedArea>
{:catch err} 
    <Error msg={`Failed to fetch bots in queue: ${err}`} />
{/await}