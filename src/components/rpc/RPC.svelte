<script lang="ts">
	import { fetchClient, panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error, success } from '$lib/toast';
	import { onMount } from 'svelte';
	import type { RPCMethod } from '$lib/generated/arcadia/RPCMethod';
	import type { RPCWebAction } from '$lib/generated/arcadia/RPCWebAction';
	import type { TargetType } from '$lib/generated/arcadia/TargetType';
	import ButtonReact from '../button/ButtonReact.svelte';
	import InputText from '../inputs/InputText.svelte';
	import InputTextArea from '../inputs/InputTextArea.svelte';
	import BoolInput from '../inputs/BoolInput.svelte';
	import { Color } from '../button/colors';
	import InputNumber from '../inputs/InputNumber.svelte';
	import logger from '$lib/logger';
	import Hour from './Hour.svelte';
	import { panelState } from '$lib/panelState';
	import type { Query } from '$lib/generated/htmlsanitize/Query';

	interface ActionData {
		[key: string]: any;
	}

	type RPCStatusState = 'pending' | 'error' | 'success';

	interface RPCStatus {
		state: RPCStatusState;
		message: string;
	}

	export let rpcState: RPCStatus | null = null;

	export let actions: RPCWebAction[];
	export let targetType: TargetType;
	export let initialData: ActionData;

	let selected: string = '';

	const sendRpc = async () => {
		if (!selected) {
			error('Please select an action');
			return false;
		}

		let action = actions.find((a) => a.id == selected);

		if (!action) {
			rpcState = {
				state: 'error',
				message: 'Unknown action'
			};
			error('Unknown action');
			return false;
		}

		let parsedData: ActionData = {};

		logger.info('RPC', actionData);

		for (let field of action.fields) {
			switch (field.field_type) {
				case 'Boolean':
					parsedData[field.id] = actionData[field.id];
					break;
				case 'Hour':
					if (!Array.isArray(actionData[field.id])) {
						rpcState = {
							state: 'error',
							message: `Internal error: not an array: ${field.label}`
						};
						error(`Internal error: not an array: ${field.label}`);
						return false;
					}

					logger.info('RPC', actionData[field.id]);

					if (!actionData[field.id][1]) {
						rpcState = {
							state: 'error',
							message: `Please select a time unit for ${field.label}`
						};
						error(`Please select a time unit for ${field.label}`);
						return false;
					}

					if (!actionData[field.id][0]) {
						rpcState = {
							state: 'error',
							message: `Please enter a value for ${field.label}`
						};
						error(`Please enter a value for ${field.label}`);
						return false;
					}

					let unit = actionData[field.id][1] as string;

					switch (unit) {
						case 'hour':
							parsedData[field.id] = actionData[field.id][0];
							break;
						case 'day':
							parsedData[field.id] = actionData[field.id][0] * 24;
							break;
						case 'week':
							parsedData[field.id] = actionData[field.id][0] * 24 * 7;
							break;
						case 'month':
							parsedData[field.id] = actionData[field.id][0] * 24 * 30;
							break;
						case 'year':
							parsedData[field.id] = actionData[field.id][0] * 24 * 365;
							break;
						default:
							rpcState = {
								state: 'error',
								message: `Unknown time unit ${unit}`
							};
							error(`Unknown time unit ${unit}`);
							return false;
					}
					break;
				default:
					if (!actionData[field.id]) {
						rpcState = {
							state: 'error',
							message: `Please enter a value for ${field.label}`
						};
						error(`Please enter a value for ${field.label}`);
						return false;
					}
					parsedData[field.id] = actionData[field.id];
					break;
			}
		}

		try {
			let res = await panelQuery({
				ExecuteRpc: {
					login_token: $panelAuthState?.loginToken || '',
					target_type: targetType,
					method: {
						[selected]: parsedData
					} as RPCMethod
				}
			});

			if (!res.ok) {
				let err = await res.text();
				rpcState = {
					state: 'error',
					message: `Failed to execute action: ${err}`
				};
				error(err);
				return false;
			}

			if (res.status == 204) {
				rpcState = {
					state: 'success',
					message: 'Successfully executed action [204]'
				};
				success('Successfully executed action [204]');
				return true;
			}

			let data = await res.text();

			if (data) {
				rpcState = {
					state: 'success',
					message: `${data}\n\nStatus Code: 200`
				};
				success(`${data} [200]`);
				return true;
			} else {
				rpcState = {
					state: 'success',
					message: 'Successfully executed action [200]'
				};
				success('Successfully executed action [200]');
				return true;
			}
		} catch (e: any) {
			rpcState = {
				state: 'error',
				message: `Failed to execute action: ${e}`
			};
			error(`Failed to execute action: ${e}`);
			return false;
		}
	};

	const parseMd = async (str: string): Promise<string> => {
		let hs: Query = {
			SanitizeRaw: {
				body: str
			}
		};

		let hsUrl = $panelState?.core_constants?.htmlsanitize_url;

		if (!hsUrl) {
			throw new Error('Failed to get HTMLSanitize URL');
		}

		let res = await fetchClient(`${hsUrl}/query`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(hs)
		});

		if (!res.ok) {
			throw new Error(`Failed to sanitize HTML: ${await res.text()} [${res.status}]`);
		}

		return await res.text();
	};

	let actionData: ActionData = {};

	onMount(() => {
		actionData = {
			...initialData
		};
	});

	let readyToRender = false;
</script>

<select
	class="w-full mx-auto mt-4 flex transition duration-200 hover:bg-gray-800 bg-gray-700 bg-opacity-100 text-white focus:text-themable-400 rounded-xl border border-white/10 focus:border-themable-400 focus:outline-none py-2 px-6"
	bind:value={selected}
	on:change={() => {
		readyToRender = false;

		actionData = {
			...initialData
		};

		let action = actions.find((a) => a.id == selected);

		action?.fields.forEach((f) => {
			switch (f.field_type) {
				case 'Boolean':
					actionData[f.id] = false;
					break;
				case 'Hour':
					actionData[f.id] = [0, 'hour'];
					break;
			}
		});

		readyToRender = true;
	}}
>
	<option value="">Select an action</option>
	{#each actions as action}
		{#if action.supported_target_types.includes(targetType)}
			<option id={action.id} value={action.id}>{action.label}</option>
		{/if}
	{/each}
</select>

<div class="p-1">
	{#key selected}
		{#if selected && readyToRender}
			{#each actions.find((a) => a.id == selected)?.fields || [] as field}
				{#if initialData && initialData[field.id]}
					<p>
						<span class="font-semibold">{field.label} [{field.id}]: </span>
						{initialData[field.id]}
					</p>
				{:else if field.field_type == 'Text'}
					<InputText
						id={field.id}
						label={field.label}
						placeholder={field.placeholder}
						bind:value={actionData[field.id]}
						minlength={5}
					/>
				{:else if field.field_type == 'Textarea'}
					<InputTextArea
						id={field.id}
						label={field.label}
						placeholder={field.placeholder}
						bind:value={actionData[field.id]}
						minlength={5}
					/>
				{:else if field.field_type == 'Boolean'}
					<BoolInput
						id={field.id}
						label={field.label}
						description={field.placeholder}
						bind:value={actionData[field.id]}
						disabled={false}
					/>
				{:else if field.field_type == 'Number'}
					<InputNumber
						id={field.id}
						label={field.label}
						placeholder={field.placeholder}
						bind:value={actionData[field.id]}
						minlength={5}
					/>
				{:else if field.field_type == 'Hour'}
					<Hour bind:value={actionData[field.id]} {field} />
				{:else}
					<p class="text-red-500 break-words break-all">
						Unknown field type: {field.field_type} for id {field.id} [{JSON.stringify(field)}]
					</p>
				{/if}
			{/each}
		{/if}
	{/key}
</div>

<div class="mt-1" />

{#if selected}
	<ButtonReact
		color={Color.Themable}
		states={{
			loading: 'Executing action...',
			success: 'Successfully executed action',
			error: 'Failed to execute action'
		}}
		onClick={sendRpc}
		icon="mdi:send"
		text="Execute"
	/>
{/if}

{#if rpcState}
	{#if rpcState.state == 'success'}
		<section
			class="rpc-status rpc-status-success mt-1 bg-green-600 bg-opacity-80 rounded-sm p-2 text-white font-semibold break-words break-all"
		>
			{#await parseMd(rpcState.message)}
				{@html rpcState.message}
			{:then parsed}
				{@html parsed}
			{:catch e}
				{@html rpcState.message}
				{#if e}
					HTMLSanitize Error: {e}
				{/if}
			{/await}
		</section>
	{:else if rpcState.state == 'error'}
		<section
			class="rpc-status rpc-status-error mt-1 bg-red-600 bg-opacity-80 rounded-sm p-2 text-white font-semibold break-words break-all"
		>
			{#await parseMd(rpcState.message.replaceAll('\n', '\n\n'))}
				{@html rpcState.message}
			{:then parsed}
				{@html parsed}
			{:catch e}
				{@html rpcState.message}
				{#if e}
					HTMLSanitize Error: {e}
				{/if}
			{/await}
		</section>
	{/if}
{/if}
