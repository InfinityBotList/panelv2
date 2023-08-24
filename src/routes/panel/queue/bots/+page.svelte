<script lang="ts">
	import { panelAuthState } from '$lib/panelAuthState';
	import Loading from '../../../../components/Loading.svelte';
	import Error from '../../../../components/Error.svelte';
	import type { PanelQuery } from '../../../../utils/generated/arcadia/PanelQuery';
	import type { QueueBot } from '../../../../utils/generated/arcadia/QueueBot';

	const fetchQueueBots = async () => {
		let lp: PanelQuery = {
			BotQueue: {
				login_token: $panelAuthState?.loginToken || ''
			}
		};
		let res = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});
		let bots: QueueBot[] = await res.json();

		return bots;
	};
</script>

{#await fetchQueueBots()}
	<Loading msg={'Fetching bots in queue...'} />
{:then bots}
	<code>{JSON.stringify(bots)}</code>
{:catch err}
	<Error msg={`Failed to fetch bots in queue: ${err}`} />
{/await}
