<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error, success } from '$lib/toast';
	import GreyText from '../../../components/GreyText.svelte';
	import Modal from '../../../components/Modal.svelte';
	import ButtonReact from '../../../components/button/ButtonReact.svelte';
	import { Color } from '../../../components/button/colors';
	import InputText from '../../../components/inputs/InputText.svelte';
	import type { Partner } from '$lib/generated/arcadia/Partner';
	import { renderPreview, uploadFileChunks } from '$lib/fileutils';
	import type { PartnerType } from '$lib/generated/arcadia/PartnerType';
	import ExtraLinks from '../../../components/inputs/multi/extralinks/ExtraLinks.svelte';
	import FileUpload from '../../../components/inputs/FileUpload.svelte';
	import Icon from '@iconify/svelte';
	import type { CdnAssetItem } from '$lib/generated/arcadia/CdnAssetItem';
	import logger from '$lib/logger';
	import { commonButtonReactStates, setupWarning, type WarningBox as WB } from '../../../components/warningbox/warningBox';
	import WarningBox from '../../../components/warningbox/WarningBox.svelte';

	// File stuff
	let imageFile: File;
	let imageUploaded: boolean = false;
	let imageMimeType: string;
	let imageFilePreviewBox: HTMLDivElement;

	let showActionsModal: boolean = false;
	let showWarningBox: boolean = false
	export let partnerTypes: PartnerType[];
	export let partnerIds: string[];
	export let mainScope: string;
	export let partner: Partner;

	let status: string[] = [];
	const addStatus = (s: string) => {
		status.push(s);
		status = status;
	};

	const deletePartner = async () => {
		let res = await panelQuery({
			UpdatePartners: {
				login_token: $panelAuthState?.loginToken || '',
				action: {
					Delete: {
						id: partner?.id || ''
					}
				}
			}
		});

		if (!res.ok) {
			let err = await res.text();
			error(`Could not delete partner: ${err}`);
			return false;
		}

		success('Successfully deleted partner');
		return true;
	}

	export let warningBox: WB = {
		header: 'Confirm Deletion',
		text: `Are you sure you want to delete partner '${partner.name}' with ID ${partner.id}? This is an irreversible action.`,
		buttonStates: {
			normal: 'Delete Partner',
			loading: 'Deleting partner...',
			success: 'Successfully deleted this partner',
			error: 'Failed to delete partner'
		},
		onConfirm: deletePartner,
	};

	const editPartner = async () => {
		if (
			!partner.id ||
			!partner.name ||
			!partner.type ||
			!partner.short ||
			partner.links.length < 1 ||
			!partner.user_id
		) {
			error('Please fill out all fields');
			return false;
		}

		if(!partnerIds.includes(partner.id)) {
			error('Partner ID does not already exist');
			return false;
		}

		for (let link of partner.links) {
			if (!link.name || !link.value) {
				error(`Link name or value is empty: ${link.name} ${link.value}`);
				return false;
			}

			if (!link.value.startsWith("https://")) {
				error(`Link value must start with https://: ${link.name} ${link.value}`);
				return false;
			}
		}

		addStatus("Checking user ID...");

		let userRes = await panelQuery({
			GetUserPerms: {
				user_id: partner.user_id
			}
		});

		if(!userRes.ok) {
			let err = await userRes.text();
			error(`Failed to check user ID: ${err}`);
			return false;
		}

		addStatus("Checking image...");

		if (!imageUploaded) {
			error('Please upload an image');
			return false;
		}

		if(!imageMimeType?.includes("/")) {
			error("Invalid image mime type");
			return false;
		}

		addStatus("Checking existing partner image list...");

		let files = await panelQuery({
			UpdateCdnAsset: {
				login_token: $panelAuthState?.loginToken || '',
				path: 'partners',
				name: '',
				action: 'ListPath',
				cdn_scope: mainScope
			}
		});

		if (!files.ok) {
			let err = await files.text();
			error(`Failed to list CDN path: ${err}`);
			return false;
		}

		let filesJson: CdnAssetItem[] = await files.json();

		logger.info('EditPartner', 'Got CDN files', filesJson);

		let paths = filesJson.map((f) => f.name);

		addStatus(`=> Found partners: ${paths}`);

		for (let path of paths) {
			if (path == `${partner.id}.webp`) {
				addStatus(`=> Deleting existing partner image: ${path}`);

				let del = await panelQuery({
					UpdateCdnAsset: {
						login_token: $panelAuthState?.loginToken || '',
						path: 'partners',
						name: path,
						action: 'Delete',
						cdn_scope: mainScope
					}
				});

				if (!del.ok) {
					let err = await del.text();
					error(`Failed to delete existing partner image: ${err}`);
					return false;
				}

				addStatus(`=> Deleted existing partner image: ${path}`);
			} else if (path?.split('.')?.length != 2) {
				addStatus(`=> Deleting unknown file: ${path}`);

				let del = await panelQuery({
					UpdateCdnAsset: {
						login_token: $panelAuthState?.loginToken || '',
						path: 'partners',
						name: path,
						action: 'Delete',
						cdn_scope: mainScope
					}
				});

				if (!del.ok) {
					let err = await del.text();
					error(`Failed to delete unknown file: ${err}`);
					return false;
				}

				addStatus(`=> Deleted unknown file: ${path}`);
			}
		}

		// Calculate sha512 hash of the image
		addStatus('=> Calculating image hash...');
		let hash = await crypto.subtle.digest(
			'sha-512',
			await imageFile.arrayBuffer()
		);

		// Convert hash to hex
		let hashArray = Array.from(new Uint8Array(hash));
		let hashHex = hashArray
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');

		addStatus(`=> Calculated image hash: ${hashHex}`);

		addStatus('=> Uploading image chunks to CDN...');

		let chunkIds = await uploadFileChunks(imageFile, {
			onChunkUploaded: (chunkId, size) => {
				addStatus(`=> Uploaded chunk ${chunkId} (${size} bytes)`);
			},
		})

		addStatus('=> Creating file with chunk IDs on CDN...');

		let upload = await panelQuery({
			UpdateCdnAsset: {
				login_token: $panelAuthState?.loginToken || '',
				path: 'partners',
				name: `${partner.id}.webp`,
				action: {
					AddFile: {
						overwrite: false,
						chunks: chunkIds,
						sha512: hashHex
					}
				},
				cdn_scope: mainScope
			}
		});

		if (!upload.ok) {
			let err = await upload.text();
			error(`Failed to upload image to CDN: ${err}`);
			return false;
		}

		addStatus('=> Uploaded image to CDN');

		addStatus('Editting partner in database...');

		let res = await panelQuery({
			UpdatePartners: {
				login_token: $panelAuthState?.loginToken || '',
				action: {
					Update: {
						partner,
					}
				}
			}
		});

		if (!res.ok) {
			let err = await res.text();
			error(`Failed to edit partner: ${err}`);
			return false;
		}

		addStatus('=> Editted partner in database');
		return true;
	};
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

		<h2 class="text-xl font-semibold">Edit Partner</h2>

		<InputText
			id="partner-id"
			label="Partner ID"
			placeholder="Partner ID"
			bind:value={partner.id}
			minlength={5}
		/>

		<InputText
			id="partner-name"
			label="Partner Name"
			placeholder="Partner Name"
			bind:value={partner.name}
			minlength={5}
		/>

		<select
			class="w-full mx-auto mt-4 flex transition duration-200 hover:bg-gray-800 bg-gray-700 bg-opacity-100 text-white focus:text-themable-400 rounded-xl border border-white/10 focus:border-themable-400 focus:outline-none py-2 px-6"
			bind:value={partner.type}
		>
			<option value="">Select an action</option>
			{#each partnerTypes as type}
				<option id={type.id} value={type.id}>{type.name}</option>
			{/each}
		</select>

		{#if partner.type}
			<small id="preview"
				><span class="font-semibold">{partner.type}: </span>{partnerTypes.find(
					(t) => t.id == partner.type
				)?.short}</small
			>
		{/if}

		<InputText
			id="partner-short"
			label="Partner Short"
			placeholder="Partner Short"
			bind:value={partner.short}
			minlength={5}
		/>

		<ExtraLinks bind:values={partner.links} />

		<InputText
			id="partner-uid"
			label="User ID of owner"
			placeholder="User ID of the partner's owner"
			bind:value={partner.user_id}
			minlength={5}
		/>

		<FileUpload 
			id="avatar"
			label="Partner Avatar"
			bind:file={imageFile}
			bind:fileMimeType={imageMimeType}
			bind:fileUploaded={imageUploaded}
			acceptableTypes={[
				"image/png",
				"image/jpeg",
				"image/gif",
				"image/webp"
			]}
		/> 

		{#if imageUploaded}
			<p class="font-semibold">Image to upload to CDN ({imageMimeType.split('/')[1]})</p>
			
			{#await renderPreview(async (_, __) => {
				return imageFile
			}, mainScope, {
				name: `${partner.id}.${imageMimeType.split('/')[1]}`,
				path: "partners",
				size: BigInt(0),
				last_modified: BigInt(0),
				permissions: 0o644,
				is_dir: false
			}, imageFilePreviewBox)}
				<Icon icon="mdi:loading" class="inline animate-spin text-2xl" />
				<span class="text-xl">Loading Preview</span>
			{:catch err}
				<p  class="text-red-500">{err?.toString()}</p>
			{/await}
			<div bind:this={imageFilePreviewBox} />    
		{/if}

		<ButtonReact
			color={Color.Themable}
			onClick={editPartner}
			icon="mdi:save"
			text="Edit Partner"
			states={{
				loading: 'Editting Partner...',
				success: 'Partner Editted!',
				error: 'Failed to edit partner'
			}}
		/>

		<h2 class="text-xl font-semibold">Delete Partner</h2>
		<GreyText>Note that this is IRREVERSIBLE</GreyText>
		<ButtonReact
			color={Color.Red}
			states={commonButtonReactStates}
			onClick={async () => {
				setupWarning(warningBox);
				showActionsModal = false;
				showWarningBox = true
				return true
			}}
			icon="mdi:trash-can-outline"
			text="Delete Partner"
		/>
	</Modal>
{/if}

<WarningBox bind:warningBox={warningBox} bind:show={showWarningBox} />