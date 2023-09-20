<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import Loading from '../../../components/Loading.svelte';
	import type { Link } from '../../../utils/generated/arcadia/Link';
	import ErrorComponent from '../../../components/Error.svelte';
	import GreyText from '../../../components/GreyText.svelte';

	const fetchCdnScopes = async () => {
		let res = await panelQuery({
			ListCdnScopes: {
				login_token: $panelAuthState?.loginToken || ''
			}
		});

		if (!res.ok) {
			let err = await res.text();
			throw new Error(`Failed to fetch CDN scopes: ${err}`);
		}

		let cdnScopes: Link[] = await res.json();

		return cdnScopes;
	};
</script>

{#await fetchCdnScopes()}
	<Loading msg="Fetching CDN scopes..." />
{:then cdnScopes}
	<h1 class="text-3xl font-semibold">Choose a scope</h1>
	<GreyText
		>A scope is essentially a network share of a CDN on the server that is exposed to the panel!</GreyText
	>
    <div id="link-box" class="border rounded-md">
        {#each cdnScopes as cdnScope, i}
		    <a href={`/panel/cdn/${cdnScope.name}`} class={`rounded-md block text-white hover:bg-slate-800 p-4 ${(i < cdnScopes.length - 1) ? "border-b" : ""}`}>
			    {cdnScope.name}
                <div class="mt-2 text-gray-400"><span class="font-semibold">Location: </span>{cdnScope.value}</div>
            </a>
	    {/each}
    </div>
{:catch err}
	<ErrorComponent msg={`Failed to fetch CDN scopes: ${err?.toString()}`} />
{/await}
