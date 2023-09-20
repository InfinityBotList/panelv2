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

    export let status: string = "initialLoad";

    const loadCdnPath = async () => {
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

        return items
    }

	afterNavigate(() => {
		$cdnStateStore = {
            path: ""
        }
	});
</script>

{#key $cdnStateStore?.path}
    {#await loadCdnPath()}
        <Loading msg="Loading CDN path entries" />
    {:then files}
        <p><span class="font-semibold">Status: </span>{status}</p>
        <p><span class="font-semibold">Current Path: </span>/{$cdnStateStore.path}</p>
        <div class="mb-4"></div>
        <FileView files={files} />
    {:catch err}
        <ErrorComponent msg={`Failed to load CDN path entries: ${err?.toString()}`} />
    {/await}
{/key}