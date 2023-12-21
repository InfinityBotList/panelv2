<script lang="ts">
	import { panelQuery } from "$lib/fetch";
	import type { StaffPosition } from "$lib/generated/arcadia/StaffPosition";
	import { panelAuthState } from "$lib/panelAuthState";
	import Loading from "../../../../components/Loading.svelte";
    import ErrorComponent from "../../../../components/Error.svelte";
	import StaffPositionCard from "./StaffPositionCard.svelte";

    const fetchStaffPositionList = async () => {
        let res = await panelQuery({
            UpdateStaffPositions: {
                login_token: $panelAuthState?.loginToken || '',
                action: "ListPositions"
            }
        })

        if(!res.ok) {
            throw new Error("Failed to fetch staff position list")
        }

        let staffPositionList: StaffPosition[] = await res.json()

        return {
            staffPositionList
        }
    }
</script>

<h1 class="text-3xl font-semibold">Staff Positions</h1>

{#await fetchStaffPositionList()}
    <Loading msg={"Loading staff positions..."} />
{:then { staffPositionList }} 
    {#each staffPositionList as staffPosition}
        <StaffPositionCard staffPosition={staffPosition} staffPositionList={staffPositionList}></StaffPositionCard>
    {/each}
{:catch error}
    <ErrorComponent msg={error?.toString() || "Unknown erro"} />
{/await}