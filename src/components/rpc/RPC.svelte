<script lang="ts">
	import { fetchClient } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error, success } from '$lib/toast';
	import { onMount } from 'svelte';
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
	export let initialData: ActionData;

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

	let actionData: ActionData = {}

	onMount(() => {
		actionData = {
			...initialData
		};
	})
</script>

<select
	class="w-3/4 mx-auto mt-4 flex transition duration-200 hover:bg-gray-800 bg-gray-700 bg-opacity-100 text-white focus:text-themable-400 rounded-xl border border-white/10 focus:border-themable-400 focus:outline-none py-2 px-6"
	bind:value={selected}
	on:change={() => {
		actionData = {
			...initialData
		}
	}}
>
	<option value="">Select an action</option>
	{#each actions as action}
		<option id={action.id} value={action.id}>{action.label}</option>
	{/each}
</select>

<div class="p-1">
	{#key selected}
		{#if selected}
			{#each (actions.find(a => a.id == selected)?.fields || []) as field}
				{#if initialData && initialData[field.id]}
					<p>
						<span class="font-semibold">{field.label} [{field.id}]: </span>
						{initialData[field.id]}
					</p>
				{:else}
					{#if field.field_type == "Text"}
						<InputText 
							id={field.id}
							label={field.label}
							placeholder={field.placeholder}
							bind:value={actionData[field.id]}
							minlength={5}
						/>
					{:else if field.field_type == "Textarea"}
						<InputTextArea
							id={field.id}
							label={field.label}
							placeholder={field.placeholder}
							bind:value={actionData[field.id]}
							minlength={5}
						/>
					{:else}
						<p class="text-red-500 break-words break-all">Unknown field type: {field.field_type} for id {field.id} [{JSON.stringify(field)}]</p>
					{/if}
				{/if}
			{/each}
		{/if}
	{/key}
</div>
	
<div class="mt-4"></div>
<ButtonReact onclick={() => sendRpc()}>
	Submit
</ButtonReact>
