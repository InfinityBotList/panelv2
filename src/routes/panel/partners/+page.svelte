<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelState';
	import Card from '../../../components/Card.svelte';
	import CardLinkButton from '../../../components/CardLinkButton.svelte';
	import Column from '../../../components/Column.svelte';
	import ErrorComponent from '../../../components/Error.svelte';
	import Loading from '../../../components/Loading.svelte';
	import type { Partners } from '$lib/generated/arcadia/Partners';
	import AddPartner from './AddPartner.svelte';
	import ManagePartner from './ManagePartner.svelte';

	const fetchPartnerList = async () => {
		let res = await panelQuery({
			GetPartnerList: {
				login_token: $panelAuthState?.loginToken || ''
			}
		});

		if (!res.ok) throw new Error('Failed to fetch partner list');

		let partners: Partners = await res.json();

		return {
			partners
		};
	};
</script>

{#await fetchPartnerList()}
	<Loading msg="Fetching partner list..." />
{:then partners}
	<h1 class="text-3xl font-semibold">Partner Management</h1>

	{#if $panelState?.capabilities?.includes("CdnManagement")}
		<AddPartner partnerTypes={partners?.partners?.partner_types} />
	{:else}
		<div class="mb-3"></div>
	{/if}

	<Column>
		{#each partners.partners.partners as partner, i}
			<Card>
				<img
					slot="image"
					src={`${$panelState?.coreConstants?.cdn_url}/partners/${partner?.id}.${partner?.image_type}`}
					alt=""
				/>
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
				<div slot="extra">
					<ManagePartner {partner} />
				</div>
			</Card>
		{/each}
	</Column>
{:catch err}
	<ErrorComponent msg={`Failed to fetch partner list: ${err}`} />
{/await}
