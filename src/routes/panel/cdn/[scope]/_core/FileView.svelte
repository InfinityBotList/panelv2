<script lang="ts">
	import File from "./File.svelte";
	import { cdnStateStore, cdnDataStore } from "./cdnStateStore";

    export let scope: string;
</script>

<div id="file-box" class="border rounded-md">
    {#if $cdnStateStore.path}
        <button 
            class={`w-full text-left font-bold rounded-t-md block text-white hover:bg-slate-800 p-4 ${($cdnDataStore.files.length > 0) ? "border-b" : ""}`}
            on:click={() => {
                if($cdnStateStore.path.includes("/")) {
                    // Split by slash
                    let pSplit = $cdnStateStore.path.split("/")
                    $cdnStateStore.path = pSplit.slice(0, -1).join("/")
                } else {
                    $cdnStateStore.path = ""
                }
            }}
        >
            Parent Directory (../)
        </button>
    {/if}
    {#each $cdnDataStore.files as _, index}
        <File {index} {scope} />   
    {/each}
</div>
