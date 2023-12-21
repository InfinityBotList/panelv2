<script lang="ts">
	import type { StaffPosition } from "$lib/generated/arcadia/StaffPosition";
	import { title } from "$lib/strings";
	import Icon from "@iconify/svelte";
	import ObjectRender from "../../../../components/ObjectRender.svelte";
	import SmallCard from "../../../../components/SmallCard.svelte";
	import GreyText from "../../../../components/GreyText.svelte";
	import Select from "../../../../components/inputs/select/Select.svelte";
	import { panelState } from "$lib/panelState";
	import { build, hasPerm } from "$lib/perms";
	import { error, success } from "$lib/toast";
	import logger from "$lib/logger";
	import { panelQuery } from "$lib/fetch";
	import { panelAuthState } from "$lib/panelAuthState";
	import ButtonReact from "../../../../components/button/ButtonReact.svelte";
	import { Color } from "../../../../components/button/colors";

    const getTopPosition = (spl: StaffPosition[]) => {
        let topPosition: StaffPosition | null = null

        for(let sp of spl) {
            if(!topPosition) {
                topPosition = sp
                continue
            }

            if(sp.index < topPosition.index) {
                topPosition = sp
            }
        }

        return topPosition
    }

    const allAvailableActions = ["swap_index"] as const
    type AvailableActions = typeof allAvailableActions[number] // https://stackoverflow.com/questions/51521808/how-do-i-create-a-type-from-a-string-array-in-typescript

    const getAllActions = (): AvailableActions[] => {
        if(!topUserPosition) {
            topUserPosition = getTopPosition($panelState?.staff_member?.positions || [])
        }

        let canManageAll = hasPerm($panelState?.staff_member?.resolved_perms || [], build("staff_positions", "manage"))

        let available: AvailableActions[] = []

        let commonPerms: AvailableActions[] = ["swap_index"]

        for(let perm of commonPerms) {
            if(topUserPosition?.index && staffPosition.index <= topUserPosition?.index) {
                continue
            }
            if(canManageAll || hasPerm($panelState?.staff_member?.resolved_perms || [], build("staff_positions", perm))) {
                available.push(perm)
            }
        }

        return available
    }

    export let staffPositionList: StaffPosition[]
    export let staffPosition: StaffPosition

    let swapIndexOpen: boolean = false
    let swapIndex: number | null = null
    let swapIndexProposed: string | undefined;
    const swapIndexExecute = async () => {
        if(!swapIndex) {
            error("Please select a position to swap with")
            return false
        }

        let b = staffPositionList.find(sp => sp.index == swapIndex)

        if(!b) {
            error("Invalid index")
            return false
        }

        let res = await panelQuery({
            UpdateStaffPositions: {
                login_token: $panelAuthState?.loginToken || '',
                action: {
                    SwapIndex: {
                        a: staffPosition.id,
                        b: b.id
                    }
                },
            }
        })

        if(!res.ok) {
            let err = await res.text()
            throw new Error(`Failed to swap index: ${err?.toString() || "Unknown error"}`)
        }

        success("Swapped index!")
        return true
    }

    let topUserPosition: StaffPosition | null = getTopPosition($panelState?.staff_member?.positions || [])
    let availableActions: AvailableActions[] = getAllActions()

    $: {
        logger.info("swapIndexProposed", swapIndexProposed)
        if(swapIndexProposed) {
            let pInt = parseInt(swapIndexProposed)
            if(isNaN(pInt)) {
                error("Invalid index")
                swapIndex = null
            } else {
                swapIndex = pInt
            }
        } else {
            swapIndex = null
        }
    }

    $: {
        topUserPosition = getTopPosition($panelState?.staff_member?.positions || [])
        availableActions = getAllActions()
    }
</script>


<SmallCard>
    <h1 class="text-2xl font-semibold">{title(staffPosition.name.replaceAll("_", " "))} <span class="opacity-80">({staffPosition.name})</span></h1>
    <details>
        <summary class="hover:cursor-pointer">View Advanced Information</summary>
        <ObjectRender object={staffPosition}></ObjectRender>
    </details>

    {#if availableActions.length > 0}
        <h2 class="mt-3 mb-1 text-xl">Actions</h2>
        <div class="mb-3 border rounded-md">
            {#if availableActions.includes("swap_index")}
                <button 
                    on:click={() => {
                        swapIndexOpen = !swapIndexOpen
                    }}
                    class="text-white hover:text-gray-300 focus:outline-none px-2 py-3 border-r"
                >
                    <Icon icon="ph:swap" class={"text-2xl inline-block align-bottom"} />
                    {swapIndexOpen ? "Close" : "Change Position"}
                </button> 
            {/if}
        </div>    

        {#if swapIndexOpen}
            <h1 class="text-2xl">Swap With Index</h1>
            <GreyText>A simple way to change position hierarchy is by swapping the permissions index with one that is lower (lower index = higher in hierarchy)</GreyText>
            
            <Select bind:value={swapIndexProposed} id="indexswap" label="Choose Permission To Swap With" choices={staffPositionList?.filter(sp => sp.id != staffPosition.id && (topUserPosition?.index || topUserPosition?.index == 0) && topUserPosition.index < sp.index).map(sp => {
                return {
                    label: `${title(sp.name.replaceAll("_", " "))} (${sp.name}) [${sp.index}]`,
                    value: sp.index.toString(),
                    id: sp.id,
                }
            })} />

            <ButtonReact 
                color={Color.Themable}
                icon="ph:swap"
                onClick={swapIndexExecute}
                states={{
                    loading: "Swapping index...",
                    success: "Swapped index!",
                    error: "Failed to swap index!"
                }}
                text="Swap Index"
            />
        {/if}
    {/if}
</SmallCard>