<script lang="ts">
	import { fetchClient, panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error, success } from '$lib/toast';
	import GreyText from '../../../components/GreyText.svelte';
	import Modal from '../../../components/Modal.svelte';
	import ButtonReact from '../../../components/button/ButtonReact.svelte';
	import { Color } from '../../../components/button/colors';
	import InputText from '../../../components/inputs/InputText.svelte';
	import type { Partner } from '../../../utils/generated/arcadia/Partner';

	let showActionsModal: boolean = false;
	let showWarningModal: boolean = false;
	export let partner: Partner;

	interface WarningBox {
		header: string;
		text: string;
		nonce?: string;
		buttonText: {
			normal: string;
			loading: string;
			success: string;
			error: string;
		},
		inputtedText?: string;
		onConfirm: () => Promise<boolean>;
	}

	const createWarning = (wb: WarningBox) => {
		wb.nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		warningBox = wb;
		showActionsModal = false;
		showWarningModal = true;
	}

	export let warningBox: WarningBox | null = null
	const deletePartner = async () => {
		createWarning({
			header: 'Confirm Deletion',
			text: `Are you sure you want to delete partner '${partner.name}' with ID ${partner.id}? This is an irreversible action.`,
			buttonText: {
				normal: 'Delete Partner',
				loading: 'Deleting partner...',
				success: 'Successfully deleted this partner',
				error: 'Failed to delete partner'
			},
			onConfirm: async () => {
				let res = await panelQuery({
					DeletePartner: {
						login_token: $panelAuthState?.loginToken || '',
						partner_id: partner?.id || ''
					}
				})

				if (!res.ok) {
					let err = await res.text()
					error(`Could not delete partner: ${err}`)
					return false;
				}

				success('Successfully deleted partner')
				return true;	
			}
		})

		return true;
	}
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
		<h1 slot="header" class="font-semibold text-2xl">Editting {partner?.name}</h1>

		<h2 class="text-xl font-semibold">Delete Partner</h2>
		<GreyText>Note that this is IRREVERSIBLE</GreyText>
		<ButtonReact
			color={Color.Red}
			states={{
				loading: 'Deleting partner...',
				success: 'Successfully deleted this partner',
				error: 'Failed to delete partner'
			}}
			onClick={deletePartner}
			icon="mdi:trash-can-outline"
			text="Delete Partner"
		/>
	</Modal>
{/if}

{#if showWarningModal && warningBox && warningBox.nonce}
	<Modal bind:showModal={showWarningModal}>
		<h1 slot="header" class="font-semibold text-2xl">{warningBox.header}</h1>

		<p class="font-semibold text-xl">{warningBox.text}</p>

		<p>To confirm, please type the following: <code class="select-none cursor-pointer">{warningBox.nonce}</code></p>

		<div class="mb-5" /> 

		<InputText 
			id="wb-input"
			label="Are you sure? This is dangerous"
			placeholder="Dangerous nilly!"
			bind:value={warningBox.inputtedText}
			minlength={1}
			showErrors={false}
		/>

		<div class="mb-5" /> 

		<ButtonReact
			color={Color.Red}
			states={{
				loading: warningBox.buttonText?.loading,
				success: warningBox.buttonText?.success,
				error: warningBox.buttonText?.error
			}}
			onClick={async () => {
				if(!warningBox) {
					error('Internal error: no warningBox found');
					return false;
				}

				if (warningBox.inputtedText != warningBox.nonce) {
					error('Please type the nonce correctly');
					return false;
				}

				let res = await warningBox.onConfirm();

				if (res) {
					showWarningModal = false;
				}
				return res;
			}}
			icon="mdi:trash-can-outline"
			text={warningBox.buttonText?.normal}
		/>
	</Modal>
{/if}