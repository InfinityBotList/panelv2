<script lang="ts">
	import { fetchClient } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error, success } from '$lib/toast';
	import type { PanelQuery } from '../../utils/generated/arcadia/PanelQuery';
	import type { RPCMethod } from '../../utils/generated/arcadia/RPCMethod';
	import type { RPCWebAction } from '../../utils/generated/arcadia/RPCWebAction';
	import type { TargetType } from '../../utils/generated/arcadia/TargetType';
	import ButtonReact from '../ButtonReact.svelte';
	import InputText from '../InputText.svelte';
	import InputTextArea from '../InputTextArea.svelte';
	
	interface ActionData {
		[key: string]: any;
	}

	export let actions: RPCWebAction[];
	export let targetType: TargetType;
	export let actionsFilter: string[] = [];
	export let disabled: boolean = false;
	export let seperate: boolean = false;
	export let fullButton: boolean = false;
	export let open: boolean = false;
	export let selectOpen: boolean = false;

	export let actionData: ActionData = {}

	const openDropdown = () => {
		open = !open
	};

	const openSelect = () => {
		selectOpen = true;
	};

	let selected: string = '';

	const sendRpc = async () => {
		if (!selected) return;

		let lp: PanelQuery = {
			ExecuteRpc: {
				login_token: $panelAuthState?.loginToken || '',
				target_type: targetType,
				method: {
					[selected]: actionData
				} as RPCMethod
			}
		};

		let res = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});

		if (!res.ok) {
			let err = await res.text();
			error(err);
			return
		}

		if(res.status == 204) {
			success('Successfully executed action [204]');
			return;
		}

		let data = await res.text();

		if (data) {
			success(`${data} [200]`);
			return;
		}

		if(selected == 'Approve') {
			// Open in new tab
			window.open(data, '_blank');
		}

		success('Successfully executed action [200]');
	};
</script>

{#if disabled}
	<button
		disabled={true}
		aria-disabled={true}
		class="mb-2 inline-flex items-center py-2 px-3 text-center text-white bg-blue-600 hover:cursor-not-allowed rounded-md focus:ring-4 focus:outline-none focus:ring-blue-300"
	>
		<slot />
	</button>
{:else}
	<button
		class="flex justify-center {seperate
			? 'ml-3'
			: ''} hover:opacity-75 focus:outline-none mt-3 {fullButton ? 'w-full' : 'w-1/2'} {open
			? 'rounded-t-lg'
			: 'rounded-lg'} bg-black/90 p-3 text-center text-white"
		on:click={openDropdown}
	>
		<slot />

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

	<div
		class="{open
			? 'block'
			: 'hidden'} mt-1 focus:outline-none w-full rounded-b-lg bg-black/90 text-center text-white pb-24"
	>
		<select
			class="w-3/4 mx-auto mt-4 flex transition duration-200 hover:bg-gray-800 bg-gray-700 bg-opacity-100 text-white focus:text-themable-400 rounded-xl border border-white/10 focus:border-themable-400 focus:outline-none py-2 px-6"
			on:click={openSelect}
			bind:value={selected}
			on:change={() => {
				actionData = {}
			}}
		>
			<option value="">Select an action</option>
			{#each actions.filter(a => (actionsFilter?.length == 0 || actionsFilter?.includes(a.id))) as action}
				<option id={action.id} value={action.id}>{action.label}</option>
			{/each}
		</select>

		<div class="p-1">
			{#key selected}
				{#if selected}
					{#each (actions.find(a => a.id == selected)?.fields || []) as action}
						{#if action.field_type == "Text"}
							<InputText 
								id={action.id}
								label={action.label}
								placeholder={action.placeholder}
								bind:value={actionData[action.id]}
								minlength={5}
							/>
						{:else if action.field_type == "Textarea"}
							<InputTextArea
								id={action.id}
								label={action.label}
								placeholder={action.placeholder}
								bind:value={actionData[action.id]}
								minlength={5}
							/>
						{:else}
							<p class="text-red-500 break-words break-all">Unknown field type: {action.field_type} for id {action.id} [{JSON.stringify(action)}]</p>
						{/if}
					{/each}
				{/if}
			{/key}
		</div>
			
		<div class="mt-4"></div>
		<ButtonReact onclick={() => sendRpc()}>
			Submit
		</ButtonReact>
	</div>
{/if}
