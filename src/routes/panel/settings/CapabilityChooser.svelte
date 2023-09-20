<script lang="ts">
	import { fetchClient, panelQuery } from '$lib/fetch';
	import logger from '$lib/logger';
	import { panelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelState';
	import ErrorComponent from '../../../components/Error.svelte';
	import GreyText from '../../../components/GreyText.svelte';
	import Loading from '../../../components/Loading.svelte';
	import BoolInput from '../../../components/inputs/BoolInput.svelte';
	import type { Capability } from '../../../utils/generated/arcadia/Capability';
	import type { PanelQuery } from '../../../utils/generated/arcadia/PanelQuery';

	let selectedCaps: boolean[];
	let allCaps: Capability[];

	const fetchCaps = async () => {
		let res = await panelQuery({
			GetCapabilities: {
				login_token: $panelAuthState?.loginToken || ''
			}
		});

		if (!res.ok) throw new Error('Failed to fetch capabilities');

		let caps: Capability[] = await res.json();

		selectedCaps = caps.map((_) => true);
		allCaps = caps;

		return {
			caps
		};
	};

	$: {
		logger.info('CapabilityChooser', selectedCaps);
		if ($panelState) {
			$panelState.capabilities = allCaps?.filter((_, i) => selectedCaps[i]);
		}
	}
</script>

<h1 class="mt-3 text-xl font-semibold">Capability Chooser</h1>
<GreyText>Choose and test panel functionality given specific capabilities</GreyText>

{#await fetchCaps()}
	<Loading msg="Fetching capabilities..." />
{:then caps}
	{#each caps.caps as cap, i}
		<BoolInput
			bind:value={selectedCaps[i]}
			disabled={false}
			label={cap}
			id={cap}
			description={`Toggle capability ${cap}`}
		/>
	{/each}
{:catch err}
	<ErrorComponent msg={`Failed to fetch capabilities: ${err?.toString()}`} />
{/await}
