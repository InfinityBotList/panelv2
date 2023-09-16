<script lang="ts">
	import { fetchClient } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import Column from '../../../components/Column.svelte';
	import ErrorComponent from '../../../components/Error.svelte';
	import Loading from '../../../components/Loading.svelte';
	import type { PanelQuery } from '../../../utils/generated/arcadia/PanelQuery';
	import type { Partners } from '../../../utils/generated/arcadia/Partners';

	const fetchPartnerList = async () => {
		let lp: PanelQuery = {
			GetPartnerList: {
				login_token: $panelAuthState?.loginToken || ''
			}
		}

		let res = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});

		if (!res.ok) throw new Error('Failed to fetch partner list');

		let partners: Partners = await res.json();

		return {
			partners
		};
	}
</script>

{#await fetchPartnerList()}
	<Loading msg="Fetching partner list..." />
{:then partners}
	<div class="mt-14">
		<h1 class="text-3xl font-semibold">
			Partner Management
		</h1>

		<Column>
		</Column>
	</div>
{:catch err}
	<ErrorComponent msg={`Failed to fetch partner list: ${err}`} />
{/await}