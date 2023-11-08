<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { renderPreview, uploadFileChunks } from '$lib/fileutils';
	import logger from '$lib/logger';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error } from '$lib/toast';
	import Icon from '@iconify/svelte';
	import ListItem from '../../../components/ListItem.svelte';
	import Modal from '../../../components/Modal.svelte';
	import OrderedList from '../../../components/OrderedList.svelte';
	import ButtonReact from '../../../components/button/ButtonReact.svelte';
	import { Color } from '../../../components/button/colors';
	import FileUpload from '../../../components/inputs/FileUpload.svelte';
	import InputText from '../../../components/inputs/InputText.svelte';
	import ExtraLinks from '../../../components/inputs/multi/extralinks/ExtraLinks.svelte';

	let status: string[] = [];
    let addChangelogModalOpen: boolean = false;

	const addStatus = (s: string) => {
		status.push(s);
		status = status;
	};
</script>

<button
	class="inline-block py-4 px-3 text-xl text-themable-400 hover:bg-slate-700"
	on:click={() => {
		addChangelogModalOpen = true;
	}}
>
	Add Changelog
</button>

{#if addChangelogModalOpen}
	<Modal bind:showModal={addChangelogModalOpen}>
		<h1 slot="header" class="font-semibold text-2xl">New Changelog Entry</h1>

		{#if status?.length > 0}
			<OrderedList>
				{#each status as s}
					<ListItem>{s}</ListItem>
				{/each}
			</OrderedList>
		{/if}
	</Modal>
{/if}
