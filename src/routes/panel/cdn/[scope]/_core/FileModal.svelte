<script lang="ts">
	import { page } from "$app/stores";
	import { panelQuery } from "$lib/fetch";
	import { panelAuthState } from "$lib/panelAuthState";
	import Icon from "@iconify/svelte";
	import Loading from "../../../../../components/Loading.svelte";
	import Modal from "../../../../../components/Modal.svelte";
	import type { CdnAssetItem } from "../../../../../utils/generated/arcadia/CdnAssetItem";

	export let showModal: boolean; // boolean, whether or not the modal is shown or not
    export let file: CdnAssetItem;
    export let scope: string;

    let previewBox: HTMLDivElement

    // Reads the file contents from the server
    const loadData = async () => {
        // Remove any slash prefix
        let path = file.path
        if(path.startsWith("/")) {
            path = path.slice(1)
        }

        // Remove filename from path
        let pathSplit = path.split("/")
        pathSplit.pop()

        // Join path back together
        path = pathSplit.join("/")

        let res = await panelQuery({
            UpdateCdnAsset: {
                login_token: $panelAuthState?.loginToken || "",
                cdn_scope: scope || "",
                path: path,
                name: file.name,
                action: "ReadFile"
            }
        })     
        
        if(!res.ok) {
            let err = await res.text()
            throw new Error(`Failed to read file: ${err}`)
        }

        let data = await res.blob()
        return data
    }

    const renderPreview = async () => {
        if(!file.name.includes(".")) {
            throw new Error("No preview available for this file (no extension)")
        }

        let ext = file.name.split(".").pop()

        if(!ext) {
            throw new Error("No preview available for this file (no extension)")
        }

        let data: Blob;

        switch (ext) {
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
            case "webp":
                data = await loadData()

                let img = document.createElement("img")
                img.src = URL.createObjectURL(data)
                img.classList.add("max-w-full", "max-h-full")
                if(previewBox) {
                    previewBox.appendChild(img)
                }
                break;
            case "svg":
                data = await loadData()
                let text = await data.text()
                var parser = new DOMParser();
                var doc = parser.parseFromString(text, "image/svg+xml");
                doc.documentElement.classList.add("max-w-full", "max-h-full")
                if(previewBox) {
                    previewBox.appendChild(doc.documentElement)
                }
                break;
            default:
                throw new Error("No preview available for this file (unsupported file type/extension)")
        }
    }
</script>

{#if showModal}
    <Modal bind:showModal={showModal}>
        <h1 slot="header" class="font-semibold text-2xl">{file.name}</h1>

        {#await renderPreview()}
            <Icon icon="mdi:loading" class="inline animate-spin text-2xl" />
            <span class="text-xl">Loading Preview</span>
        {:catch err}
            <p  class="text-red-500">{err?.toString()}</p>
        {/await}

        <h2 class="text-xl font-semibold">Preview</h2>
        <div bind:this={previewBox} />

        <slot />
    </Modal>
{/if}