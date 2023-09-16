<script lang="ts">
	import { fetchClient } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelData';
	import Card from '../../../components/Card.svelte';
	import CardLinkButton from '../../../components/CardLinkButton.svelte';
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
			{#each partners.partners.partners as partner, i}
				<Card>
					<img slot="image" src={`${$panelState?.coreConstants?.cdn_url}/partners/${partner?.id}.${partner?.image_type}`} alt="" />
					<svelte:fragment slot="display-name">{partner?.name}</svelte:fragment>
					<svelte:fragment slot="short">{partner?.short}</svelte:fragment>
					<svelte:fragment slot="index">#{i + 1}</svelte:fragment>
					<svelte:fragment slot="type">{partner?.type}</svelte:fragment>
					<svelte:fragment slot="actionA">
						<CardLinkButton
							target="_blank"
							link={`${$panelState?.coreConstants?.frontend_url}/about/partners`}
							showArrow={false}
							double={false}
						>
							View
						</CardLinkButton>
					</svelte:fragment>
				</Card>
			{/each}
		</Column>
	</div>
{:catch err}
	<ErrorComponent msg={`Failed to fetch partner list: ${err}`} />
{/await}