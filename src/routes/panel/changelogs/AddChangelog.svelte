<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error } from '$lib/toast';
	import ListItem from '../../../components/ListItem.svelte';
	import Modal from '../../../components/Modal.svelte';
	import OrderedList from '../../../components/OrderedList.svelte';
	import ButtonReact from '../../../components/button/ButtonReact.svelte';
	import { Color } from '../../../components/button/colors';
	import BoolInput from '../../../components/inputs/BoolInput.svelte';
	import InputText from '../../../components/inputs/InputText.svelte';
	import InputTextArea from '../../../components/inputs/InputTextArea.svelte';
	import MultiInput from '../../../components/inputs/multi/simple/MultiInput.svelte';

	let version: string;
	let extra_description: string;
	let added: string[] = [];
	let updated: string[] = [];
	let removed: string[] = [];
	let prerelease: boolean = false;

	let status: string[] = [];
    let addChangelogModalOpen: boolean = false;

	const addStatus = (s: string) => {
		status.push(s);
		status = status;
	};

	const addChangelog = async () => {
		addStatus("=> Trying to add changelog entry...")
		let res = await panelQuery({
			UpdateChangelog: {
				login_token: $panelAuthState?.loginToken || '',
				action: {
					CreateEntry: {
						version,
						extra_description,
						added,
						updated,
						removed,
						prerelease
					}
				},
			}
		});

		if (!res.ok) {
			let err = await res.text();
			error(err)
			addStatus(`Failed to add changelog entry: ${err || "Unknown error"}`);
			return false;
		}

		addStatus('Successfully added changelog entry');
		return true
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

		<InputText
			id="version"
			bind:value={version}
			label="Version"
			placeholder="4.x.x"
			minlength={0}
			showErrors={false}
		/>

		<InputTextArea
			id="extra_description"
			bind:value={extra_description}
			label="extra_description"
			placeholder="Leave blank if none"
			minlength={0}
			showErrors={false}
		/>

		<MultiInput
			id="added"
			title="Added"
			label="Added Feature"
			bind:values={added}
			placeholder="Added"
			minlength={0}
			showErrors={false}
		/>

		<MultiInput
			id="updated"
			title="Updated"
			label="Updated Feature"
			bind:values={updated}
			placeholder="Updated"
			minlength={0}
			showErrors={false}
		/>

		<MultiInput
			id="removed"
			title="Removed"
			label="Removed Feature"
			bind:values={removed}
			placeholder="Removed"
			minlength={0}
			showErrors={false}
		/>

		<BoolInput
			id="prerelease"
			bind:value={prerelease}
			label="Prerelease"
			description="Whether or not this release is a prerelease."
			disabled={false}
		/>

		<ButtonReact
			color={Color.Themable}
			onClick={addChangelog}
			icon="mdi:plus"
			text="Add Changelog Entry"
			states={{
				loading: 'Adding entry...',
				success: 'Entry added!',
				error: 'Failed to add entry!'
			}}
		/>

		{#if status?.length > 0}
			<OrderedList>
				{#each status as s}
					<ListItem>{s}</ListItem>
				{/each}
			</OrderedList>
		{/if}
	</Modal>
{/if}
