<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error, success } from '$lib/toast';
	import GreyText from '../../../components/GreyText.svelte';
	import Modal from '../../../components/Modal.svelte';
	import ButtonReact from '../../../components/button/ButtonReact.svelte';
	import { Color } from '../../../components/button/colors';
	import InputText from '../../../components/inputs/InputText.svelte';
	import type { ChangelogEntry } from '$lib/generated/arcadia/ChangelogEntry';
	import MultiInput from '../../../components/inputs/multi/simple/MultiInput.svelte';
	import BoolInput from '../../../components/inputs/BoolInput.svelte';
	import InputTextArea from '../../../components/inputs/InputTextArea.svelte';

	let showActionsModal: boolean = false;
	let showWarningModal: boolean = false;

    let githubHtml: string;

	export let changelog: ChangelogEntry;

    let status: string[] = [];
    const addStatus = (s: string) => {
        status.push(s);
        status = status;
    };

	interface WarningBox {
		header: string;
		text: string;
		nonce?: string;
		buttonText: {
			normal: string;
			loading: string;
			success: string;
			error: string;
		};
		inputtedText?: string;
		onConfirm: () => Promise<boolean>;
	}

	const createWarning = (wb: WarningBox) => {
		wb.nonce =
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		warningBox = wb;
		showActionsModal = false;
		showWarningModal = true;
	};

	export let warningBox: WarningBox | null = null;
	const deleteChangelog = async () => {
		createWarning({
			header: 'Confirm Deletion',
			text: `Are you sure you want to delete changelog entry for version '${changelog.version}'? This is an irreversible action.`,
			buttonText: {
				normal: 'Delete Changelog',
				loading: 'Deleting changelog...',
				success: 'Successfully deleted this changelog',
				error: 'Failed to delete changelog'
			},
			onConfirm: async () => {
				let res = await panelQuery({
					UpdateChangelog: {
                        login_token: $panelAuthState?.loginToken || '',
                        action: {
                            DeleteEntry: {
                                version: changelog.version
                            }
                        }
                    }
				});

				if (!res.ok) {
					let err = await res.text();
					error(`Could not delete changelog: ${err}`);
					return false;
				}

				success('Successfully deleted changelog');
				return true;
			}
		});

		return true;
	};

	const editChangelog = async () => {
        let changelogData = {
            ...changelog,
            github_html: githubHtml || null,
        }

		addStatus("=> Trying to edit changelog entry...")
		let res = await panelQuery({
			UpdateChangelog: {
				login_token: $panelAuthState?.loginToken || '',
				action: {
					UpdateEntry: changelogData
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

    $: {
        if(changelog?.github_html) {
            githubHtml = changelog.github_html;
        }
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
		<h1 slot="header" class="font-semibold text-2xl">Editting changelog for {changelog?.version}</h1>

        <h2 class="text-xl font-semibold">Edit Changelog</h2>

		<InputText
			id="version"
			bind:value={changelog.version}
			label="Version"
			placeholder="4.x.x"
			minlength={0}
			showErrors={false}
		/>

		<InputTextArea
			id="extra_description"
			bind:value={changelog.extra_description}
			label="Extra Description"
			placeholder="Leave blank if none"
			minlength={0}
			showErrors={false}
		/>

		<InputTextArea
			id="github_html"
			bind:value={githubHtml}
			label="Github HTML"
			placeholder="Leave blank if none"
			minlength={0}
			showErrors={false}
		/>

		<MultiInput
			id="added"
			title="Added"
			label="Added Feature"
			bind:values={changelog.added}
			placeholder="Added"
			minlength={0}
			showErrors={false}
		/>

		<MultiInput
			id="updated"
			title="Updated"
			label="Updated Feature"
			bind:values={changelog.updated}
			placeholder="Updated"
			minlength={0}
			showErrors={false}
		/>

		<MultiInput
			id="removed"
			title="Removed"
			label="Removed Feature"
			bind:values={changelog.removed}
			placeholder="Removed"
			minlength={0}
			showErrors={false}
		/>

		<BoolInput
			id="prerelease"
			bind:value={changelog.prerelease}
			label="Prerelease"
			description="Whether or not this release is a prerelease."
			disabled={false}
		/>

        <ButtonReact
            color={Color.Themable}
            onClick={editChangelog}
            icon="mdi:plus"
            text="Edit Changelog Entry"
            states={{
                loading: 'Editting entry...',
                success: 'Entry editted!',
                error: 'Failed to edit entry!'
            }}
        />

		<h2 class="text-xl font-semibold">Delete Changelog</h2>
		<GreyText>Note that this is IRREVERSIBLE</GreyText>
		<ButtonReact
			color={Color.Red}
			states={{
				loading: 'Deleting changelog...',
				success: 'Successfully deleted this changelog',
				error: 'Failed to delete changelog'
			}}
			onClick={deleteChangelog}
			icon="mdi:trash-can-outline"
			text="Delete Changelog"
		/>
	</Modal>
{/if}

{#if showWarningModal && warningBox && warningBox.nonce}
	<Modal bind:showModal={showWarningModal}>
		<h1 slot="header" class="font-semibold text-2xl">{warningBox.header}</h1>

		<p class="font-semibold text-xl">{warningBox.text}</p>

		<p>
			To confirm, please type the following: <code class="select-none cursor-pointer"
				>{warningBox.nonce}</code
			>
		</p>

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
				if (!warningBox) {
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
