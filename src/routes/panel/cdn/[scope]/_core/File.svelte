<script lang="ts">
	import Icon from "@iconify/svelte";
	import type { CdnAssetItem } from "../../../../../utils/generated/arcadia/CdnAssetItem";
	import { cdnStateStore } from "./cdnStateStore";

    export let files: CdnAssetItem[];
    export let index: number

    let file: CdnAssetItem;

    const fileIcon = (): string => {
        // Directory 
        if (file.is_dir) {
            return "mdi:folder"
        }

        // No file extension
        if (!file.name.includes(".")) {
            return "mdi:file"
        }

        return "bx:file"
    }

    $: file = files[index]
</script>

{#key file}
    <button 
        class={`w-full text-left rounded-md block text-white hover:bg-slate-800 p-4 ${(index < files.length - 1) ? "border-b" : ""}`}
        on:click={() => {
            if(file.is_dir) {
                if($cdnStateStore.path) {
                    $cdnStateStore.path = `${$cdnStateStore.path}/${file.name}`
                } else {
                    $cdnStateStore.path = file.name
                }
            }
        }}
    >
        <Icon icon={fileIcon()} class="text-2xl inline-block align-bottom" />
        {file.name}
        <div class="mt-2 text-gray-400"><span class="font-semibold">Location: </span>{file.path}</div>
    </button>
{/key}