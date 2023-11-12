<script lang="ts">
	import { error, success } from '$lib/toast';
	import Modal from '../Modal.svelte';
	import ButtonReact from '../button/ButtonReact.svelte';
	import { Color } from '../button/colors';
	import InputText from '../inputs/InputText.svelte';
	import MultiInput from '../inputs/multi/simple/MultiInput.svelte';
	import BoolInput from '../inputs/BoolInput.svelte';
	import InputTextArea from '../inputs/InputTextArea.svelte';
	import type { Schema } from './types';
	import { title } from '$lib/strings';
	import { fetchFields } from './logic';
	import InputNumber from '../inputs/InputNumber.svelte';
	import Loading from '../Loading.svelte';
	import FileUploadElement from './FileUploadElement.svelte';

	export let schema: Schema<any>;

	let showActionsModal: boolean = false;
    let createData: {[key: string]: any} = {};
    let pkey: string = '';

    // Files support
    let fileKeys: string[]
    let fileData: { [key: string]: File } = {}

    let status: string[] = [];
    const addStatus = (s: string) => {
        status.push(s);
        status = status;
    };

	const addObject = async () => {
        addStatus(`=> Adding a ${schema?.name}`)
        try {
            let res = await schema?.create({
                data: createData,
                files: fileData
            })

            if(!res) {
                error(`Could not add ${schema?.name} with invalid status: ${res}`);
            }
        } catch (err) {
            error(`Could not add ${schema?.name}: ${err}`);
            return false
        }

		success(`Successfully added ${schema?.name}`);
		return true;
	};

    const fetchStateAndSetupAddData = async () => {
        let res = await fetchFields('create', schema?.fields)
        fileKeys = res.filter(f => f.type == 'file').map(f => f.id)
        return res
    }

    $: {
        pkey = schema?.getPrimaryKey('create')
        schema?.onOpen('create', 'showComponent', null)
    }
</script>

<button
	class="inline-block py-4 px-3 text-xl text-themable-400 hover:bg-slate-700"
	on:click={() => {
		showActionsModal = true;
	}}
>
	Add {title(schema?.name)}
</button>

{#if showActionsModal}
	<Modal bind:showModal={showActionsModal}>
		<h1 slot="header" class="font-semibold text-2xl">Add a {schema?.name}</h1>

        <h2 class="text-xl font-semibold">Add {title(schema?.name)} Entry</h2>

        {#await fetchStateAndSetupAddData()}
            <Loading msg="Loading field list" />
        {:then fields}
            {#each fields as field}
                {#if field.type == "text"}
                    <InputText
                        id={field.id}
                        bind:value={createData[field.id]}
                        label={field.label}
                        placeholder={field.helpText}
                        minlength={0}
                        showErrors={false}
                    />
                {:else if field.type == "textarea"}
                    <InputTextArea
                        id={field.id}
                        bind:value={createData[field.id]}
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
                        bind:values={createData[field.id]}
                        placeholder={field.helpText}
                        minlength={0}
                        showErrors={false}
                    />
                {:else if field.type == "number"}
                    <InputNumber
                        id={field.id}
                        bind:value={createData[field.id]}
                        label={field.label}
                        placeholder={field.helpText}
                        minlength={0}
                        showErrors={false}
                    />
                {:else if field.type == "boolean"}
                    <BoolInput 
                        id={field.id}
                        bind:value={createData[field.id]}
                        label={field.label}
                        description={field.helpText}
                        disabled={field.disabled}
                    />
                {:else if field.type == "file"}
                    <FileUploadElement
                        bind:outputFile={fileData[field.id]}
                        {field}
                        cap="update"
                    />
                {:else}
                    <p class="text-red-500">Unsupported field type {field.type}: {JSON.stringify(field)}</p>
                {/if}
            {/each}

            <ButtonReact
                color={Color.Themable}
                onClick={addObject}
                icon="mdi:plus"
                text={`Add ${title(schema?.name)}`}
                states={{
                    loading: 'Adding entry...',
                    success: 'Entry added!',
                    error: 'Failed to add entry!'
                }}
            />
        {:catch err}
            <p class="text-red-500">{err?.toString()}</p>
        {/await}
	</Modal>
{/if}
