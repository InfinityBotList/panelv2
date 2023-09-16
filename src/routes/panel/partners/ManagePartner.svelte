<script lang="ts">
	import Modal from '../../../components/Modal.svelte';
	import RPC from '../../../components/rpc/RPC.svelte';
	import type { Partner } from '../../../utils/generated/arcadia/Partner';
	import type { RPCWebAction } from '../../../utils/generated/arcadia/RPCWebAction';

	let showActionsModal: boolean = false;
	export let partner: Partner;
	export let actions: RPCWebAction[];
</script>

<button
	class="flex justify-center hover:opacity-75 focus:outline-none mt-3 w-full rounded-lg bg-black/90 p-3 text-center text-white"
	on:click={() => {
		showActionsModal = true;
	}}
>
	Actions

	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class="w-6 h-6"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
		/>
	</svg>
</button>

{#if showActionsModal}
	<Modal bind:showModal={showActionsModal}>
		<h1 slot="header" class="font-semibold text-2xl">Perform RPC Action</h1>
		<RPC
			{actions}
			targetType={'Bot'}
			initialData={{
				target_id: partner?.id
			}}
		/>
	</Modal>
{/if}
