<script lang="ts">
	import { panelQuery } from "$lib/fetch";
	import { panelAuthState } from "$lib/panelAuthState";
	import Icon from "@iconify/svelte";
	import Modal from "../../../../../components/Modal.svelte";
	import type { CdnAssetItem } from "../../../../../utils/generated/arcadia/CdnAssetItem";
	import ErrorComponent from "../../../../../components/Error.svelte";
	import type { CdnScopeData } from "../../../../../utils/generated/arcadia/CdnScopeData";

	export let showModal: boolean; // boolean, whether or not the modal is shown or not
    export let file: CdnAssetItem;
    export let scope: string;

    let previewBox: HTMLDivElement

    // Get scope list
    const getScope = async () => {
        let res = await panelQuery({
            ListCdnScopes: {
                login_token: $panelAuthState?.loginToken || ""
            }
        })

        if(!res.ok) {
            let err = await res.text()
            throw new Error(`Failed to get CDN scopes: ${err}`)
        }

        let scopes: { [key: string]: CdnScopeData } = await res.json()
        let scopeData = scopes[scope]

        if(!scopeData) {
            throw new Error(`Failed to find scope ${scope}`)
        }

        return {
            scopes,
            scopeData
        }
    }

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
                img.classList.add("max-w-full", "max-h-full", "bg-white")
                if(previewBox) {
                    previewBox.appendChild(img)
                }
                break;
            case "svg":
                data = await loadData()
                let text = await data.text()
                var parser = new DOMParser();
                var doc = parser.parseFromString(text, "image/svg+xml");
                doc.documentElement.classList.add("max-w-full", "max-h-full", "bg-white")
                if(previewBox) {
                    previewBox.appendChild(doc.documentElement)
                }
                break;
            case "pdf":
                data = await loadData()
                let pdf = document.createElement("iframe")
                pdf.src = URL.createObjectURL(data)
                pdf.classList.add("max-w-full", "max-h-full")
                if(previewBox) {
                    previewBox.appendChild(pdf)
                }
                break;
            case "json":
                data = await loadData()

                let indentedJson: string = await data.text()

                try {
                    indentedJson = JSON.stringify(JSON.parse(indentedJson), null, 2)
                } catch (e) {
                    indentedJson = `Failed to parse JSON: ${e}\n\n${indentedJson}`
                }

                let json = document.createElement("pre")
                json.innerText = indentedJson
                json.classList.add("max-w-full", "h-full")
                if(previewBox) {
                    previewBox.appendChild(json)
                }
                break;
            default:
                throw new Error("No preview available for this file (unsupported file type/extension)")
        }
    }

    
    enum ButtonState {
        Idle,
        Loading,
        Success,
        Error
    }

    interface ButtonStateData {
        state: ButtonState,
        error: any,
        getIcon: () => string,
        getIconClass: () => string
    }

    let downloadBtnState: ButtonStateData = {
        state: ButtonState.Idle,
        error: null,
        getIcon: () => {
            if(downloadBtnState?.state == ButtonState.Idle) {
                return "mdi:download"
            } else if(downloadBtnState?.state == ButtonState.Loading) {
                return "mdi:loading"
            } else if(downloadBtnState?.state == ButtonState.Success) {
                return "mdi:check"
            } else if(downloadBtnState?.state == ButtonState.Error) {
                return "mdi:alert-circle"
            }

            return "mdi:download"
        },
        getIconClass: () => {
            if(downloadBtnState?.state == ButtonState.Idle) {
                return "text-xl inline-block"
            } else if(downloadBtnState?.state == ButtonState.Loading) {
                return "text-xl inline-block animate-spin"
            } else if(downloadBtnState?.state == ButtonState.Success) {
                return "text-xl inline-block"
            } else if(downloadBtnState?.state == ButtonState.Error) {
                return "text-xl inline-block"
            }

            return "text-xl inline-block"
        }
    }
</script>

{#if showModal}
    <Modal bind:showModal={showModal}>
        <h1 slot="header" class="font-semibold text-2xl">{file.name}</h1>

        <div id="actions-box" class="mb-3">
            <button 
                on:click={async () => {
                    downloadBtnState.state = ButtonState.Loading
                    try {
                        let data = await loadData()
                        let url = URL.createObjectURL(data)
                        let a = document.createElement("a")
                        a.href = url
                        a.download = file.name
                        a?.click()
                        downloadBtnState.state = ButtonState.Success
                    } catch (e) {
                        downloadBtnState.state = ButtonState.Error
                        downloadBtnState.error = e
                    }

                    setTimeout(() => {
                        downloadBtnState.state = ButtonState.Idle
                    }, 5000)
                }}
                class="text-white hover:text-gray-300 focus:outline-none mr-2"
            >
                <Icon icon={downloadBtnState?.getIcon()} class={downloadBtnState?.getIconClass()} />
                {#if downloadBtnState?.state == ButtonState.Idle}
                    Download
                {:else if downloadBtnState?.state == ButtonState.Loading}
                    Downloading...
                {:else if downloadBtnState?.state == ButtonState.Success}
                    Downloaded!
                {:else if downloadBtnState?.state == ButtonState.Error}
                    Failed to download: {downloadBtnState?.error?.toString() || "Unknown error"}
                {/if}
            </button> 
            {#await getScope()}
                <span class="opacity-70">Loading...</span>
            {:then scopes}
                <a
                    href={`${scopes?.scopeData?.exposed_url}${file.path}`}
                    target="_blank"
                    class="text-white hover:text-gray-300 focus:outline-none mr-2"
                >
                    <Icon icon="mdi:open-in-new" class="text-xl inline-block" />
                    Open in CDN
                </a>
            {:catch err}
                <ErrorComponent msg={err?.toString() || "Failed to get CDN scopes"} />
            {/await}
        </div>

        <h2 class="text-xl font-semibold">Preview</h2>
        {#await renderPreview()}
            <Icon icon="mdi:loading" class="inline animate-spin text-2xl" />
            <span class="text-xl">Loading Preview</span>
        {:catch err}
            <p  class="text-red-500">{err?.toString()}</p>
        {/await}
        <div bind:this={previewBox} />

        <slot />
    </Modal>
{/if}