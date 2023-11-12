<script lang="ts">
	import { error, success } from '$lib/toast';
	import GreyText from '../GreyText.svelte';
	import Modal from '../Modal.svelte';
	import ButtonReact from '../button/ButtonReact.svelte';
	import { Color } from '../button/colors';
	import InputText from '../inputs/InputText.svelte';
	import MultiInput from '../inputs/multi/simple/MultiInput.svelte';
	import BoolInput from '../inputs/BoolInput.svelte';
	import InputTextArea from '../inputs/InputTextArea.svelte';
	import { commonButtonReactStates, setupWarning, type WarningBox as WB } from '../warningbox/warningBox';
	import WarningBox from '../warningbox/WarningBox.svelte';
	import type { Field, ManageSchema } from './types';
	import { title } from '$lib/strings';
	import { fetchFields } from './logic';
	import InputNumber from '../inputs/InputNumber.svelte';

	let showActionsModal: boolean = false;

	export let data: ManageSchema<any>;
    let pkey: string = '';
    let fields: Field[] = [];
    let editData: any = {};

    let status: string[] = [];
    const addStatus = (s: string) => {
        status.push(s);
        status = status;
    };

	const deleteObject = async () => {
        addStatus(`=> Deleting ${data?.schema?.name}`)
        try {
            let res = await data?.schema?.delete(editData)

            if(!res) {
                error(`Could not delete ${data?.schema?.name} with invalid status: ${res}`);
            }
        } catch (err) {
            error(`Could not delete ${data?.schema?.name}: ${err}`);
            return false
        }

		success(`Successfully deleted ${data?.schema?.name}`);
		return true;
	};

	const editObject = async () => {
        addStatus(`=> Editting ${data?.schema?.name}`)
        try {
            let res = await data?.schema?.update(editData)

            if(!res) {
                error(`Could not update ${data?.schema?.name} with invalid status: ${res}`);
            }
        } catch (err) {
            error(`Could not update ${data?.schema?.name}: ${err}`);
            return false
        }

		success(`Successfully updated ${data?.schema?.name}`);
		return true;
	};

	let warningBoxDelete: WB | undefined;
    let showWarningBoxDelete: boolean = false;

    $: {
        warningBoxDelete = data.schema.warningBox('delete', data.manageData, deleteObject)
        editData = data?.manageData || {}
        pkey = data?.schema?.getPrimaryKey('update')
        fields = fetchFields('update', editData)
        data?.schema?.onManagementModalOpen(editData)
    }
</script>

<button
	class="inline-block py-4 px-3 text-xl text-themable-400 hover:bg-slate-700"
	on:click={() => {
		showActionsModal = true;
	}}
>
	Manage
</button>

{#if showActionsModal}
	<Modal bind:showModal={showActionsModal}>
		<h1 slot="header" class="font-semibold text-2xl">Editting {data?.schema?.name} for {pkey} {data?.manageData?.[pkey]}</h1>

        <h2 class="text-xl font-semibold">Edit {title(data?.schema?.name)} Entry</h2>

        {#each fields as field}
            {#if field.type == "text"}
                <InputText
                    id={field.id}
                    bind:value={editData[field.id]}
                    label={field.label}
                    placeholder={field.helpText}
                    minlength={0}
                    showErrors={false}
		        />
            {:else if field.type == "textarea"}
                <InputTextArea
                    id={field.id}
                    bind:value={editData[field.id]}
                    label={field.label}
                    placeholder={field.helpText}
                    minlength={0}
                    showErrors={false}
                />
            {:else if field.type == "text[]"}
                <MultiInput
                    id={field.id}
                    title={field.label}
                    label={field.arrayLabel ? field.arrayLabel : field.label}
                    bind:values={editData[field.id]}
                    placeholder={field.helpText}
                    minlength={0}
                    showErrors={false}
                />
            {:else if field.type == "number"}
                <InputNumber
                    id={field.id}
                    bind:value={editData[field.id]}
                    label={field.label}
                    placeholder={field.helpText}
                    minlength={0}
                    showErrors={false}
                />
            {:else if field.type == "boolean"}
                <BoolInput 
                    id={field.id}
                    bind:value={editData[field.id]}
                    label={field.label}
                    description={field.helpText}
                    disabled={field.disabled}
                />
            {:else}
                <p class="text-red-500">Unsupported field type {field.type}: {JSON.stringify(field)}</p>
            {/if}
        {/each}


        <ButtonReact
            color={Color.Themable}
            onClick={editObject}
            icon="mdi:plus"
            text={`Edit ${title(data?.schema?.name)}`}
            states={{
                loading: 'Editting entry...',
                success: 'Entry editted!',
                error: 'Failed to edit entry!'
            }}
        />

		<h2 class="text-xl font-semibold">Delete {title(data?.schema?.name)} Entry</h2>
		<GreyText>Note that this is IRREVERSIBLE</GreyText>
		<ButtonReact
			color={Color.Red}
			states={commonButtonReactStates}
			onClick={async () => {
                if(!warningBoxDelete) {
                    error('Internal error: no warningBoxDelete found');
                    return false;
                }
				setupWarning(warningBoxDelete);
				showActionsModal = false;
				showWarningBoxDelete = true
				return true
			}}
			icon="mdi:trash-can-outline"
			text="Delete Entry"
		/>
	</Modal>
{/if}

<WarningBox bind:warningBox={warningBoxDelete} bind:show={showWarningBoxDelete} />