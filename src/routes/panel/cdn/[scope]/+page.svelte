<script lang="ts">
	import { panelQuery } from "$lib/fetch";
	import { panelAuthState } from "$lib/panelAuthState";
	import Loading from "../../../../components/Loading.svelte";
    import ErrorComponent from "../../../../components/Error.svelte";
    import { page } from "$app/stores";
	import FileView from "./_core/FileView.svelte";
	import type { CdnAssetItem } from "../../../../utils/generated/arcadia/CdnAssetItem";
	import { cdnStateStore } from "./_core/cdnStateStore";
	import { afterNavigate } from "$app/navigation";
	import InputText from "../../../../components/inputs/InputText.svelte";

    export let status: string = "loading";

    const loadCdnPath = async () => {
        status = "loading"
        let res = await panelQuery({
            UpdateCdnAsset: {
                login_token: $panelAuthState?.loginToken || "",
                cdn_scope: $page?.params?.scope || "",
                path: $cdnStateStore?.path || "",
                name: "",
                action: "ListPath"
            }
        })

        if(!res.ok) {
            let err = await res.text()
            throw new Error(`Failed to load CDN path entries: ${err}`)
        }

        let items: CdnAssetItem[] = await res.json()

        status = "ready"
        return items
    }

	afterNavigate(() => {
		$cdnStateStore = {
            path: ""
        }
	});
</script>

{#key $cdnStateStore?.path}
    <p><span class="font-semibold">Status: </span>{status}</p>
    <p><span class="font-semibold">Current Path: </span>/{$cdnStateStore.path}</p>
    {#await loadCdnPath()}
        <Loading msg="Loading CDN path entries" />
    {:then files}
        <div class="mb-4"></div>
        <FileView {files} scope={$page.params.scope} />
    {:catch err}
        <ErrorComponent msg={`Failed to load CDN path entries: ${err?.toString()}`} />
    {/await}
{/key}
<div class="mt-11">
    <InputText id="path" label="Path navigation" bind:value={$cdnStateStore.path} placeholder="Path" minlength={1} showErrors={false} />
</div>