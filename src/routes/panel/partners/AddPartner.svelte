<script lang="ts">
	import { panelQuery } from '$lib/fetch';
	import logger from '$lib/logger';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error } from '$lib/toast';
	import ListItem from '../../../components/ListItem.svelte';
	import Modal from '../../../components/Modal.svelte';
	import OrderedList from '../../../components/OrderedList.svelte';
	import ButtonReact from '../../../components/button/ButtonReact.svelte';
	import { Color } from '../../../components/button/colors';
	import InputText from '../../../components/inputs/InputText.svelte';
	import Label from '../../../components/inputs/Label.svelte';
	import ExtraLinks from '../../../components/inputs/multi/extralinks/ExtraLinks.svelte';
	import type { CdnAssetItem } from '../../../utils/generated/arcadia/CdnAssetItem';
	import type { Partner } from '../../../utils/generated/arcadia/Partner';
	import type { PartnerType } from '../../../utils/generated/arcadia/PartnerType';
	import { Buffer } from 'buffer/';

	let status: string[] = [];

	export let partnerTypes: PartnerType[];

	export let addPartnerModalOpen: boolean = false;

	let partner: Partner = {
		id: '',
		name: '',
		type: '',
		short: '',
		links: [],
		user_id: '',
		image_type: '', // internally filled out from the FileInput
		created_at: ''
	};

	let imageFileList: FileList;
	let imageBase64: string;
	let imageUploaded: boolean = false;

	const readFile = () => {
		imageUploaded = false;

		if (imageFileList.length > 1) {
			error('Please only upload one image');
		}

		if (imageFileList.length == 1) {
			let file = imageFileList[0];

			if (file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif') {
				error('Please upload a PNG/JPEG/GIF image');
				return;
			}

			partner.image_type = file.type.split('/')[1];

			let reader = new FileReader();

			reader.onload = (e) => {
				let result = e?.target?.result as ArrayBuffer;

				if (!result) {
					error('Failed to read image');
					return;
				}

				imageBase64 = Buffer.from(result).toString('base64');

				imageUploaded = true;
			};

			reader.readAsArrayBuffer(file);
		}
	};

	const addStatus = (s: string) => {
		status.push(s);
		status = status;
	};

	const addPartner = async () => {
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

		if (!imageUploaded) {
			error('Please upload an image');
			return false;
		}

		addStatus('Uploading image to CDN...');
		addStatus('=> Checking existing partner image list...');

		let files = await panelQuery({
			UpdateCdnAsset: {
				login_token: $panelAuthState?.loginToken || '',
				path: 'partners',
				name: '',
				action: 'ListPath',
				cdn_scope: 'ibl@main'
			}
		});

		if (!files.ok) {
			let err = await files.text();
			error(`Failed to list CDN path: ${err}`);
			return false;
		}

		let filesJson: CdnAssetItem[] = await files.json();

		logger.info('AddPartner', 'Got CDN files', filesJson);

		let paths = filesJson.map((f) => f.name);

		addStatus(`=> Found partners: ${paths}`);

		for (let path of paths) {
			if (path.startsWith(`${partner.id}.`)) {
				addStatus(`=> Deleting existing partner image: ${path}`);

				let del = await panelQuery({
					UpdateCdnAsset: {
						login_token: $panelAuthState?.loginToken || '',
						path: 'partners',
						name: path,
						action: 'Delete',
						cdn_scope: 'ibl@main'
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
						cdn_scope: 'ibl@main'
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

		addStatus('=> Uploading image to CDN...');

		let upload = await panelQuery({
			UpdateCdnAsset: {
				login_token: $panelAuthState?.loginToken || '',
				path: 'partners',
				name: `${partner.id}.${partner.image_type}`,
				action: {
					AddFile: {
						overwrite: false,
						contents: imageBase64
					}
				},
				cdn_scope: 'ibl@main'
			}
		});

		if (!upload.ok) {
			let err = await upload.text();
			error(`Failed to upload image to CDN: ${err}`);
			return false;
		}

		addStatus('=> Uploaded image to CDN');

		return true;
	};

	$: if (imageFileList) {
		readFile();
	}
</script>

<button
	class="inline-block py-4 px-3 text-xl text-themable-400 hover:bg-slate-700"
	on:click={() => {
		addPartnerModalOpen = true;
	}}
>
	Add Partner
</button>

{#if addPartnerModalOpen}
	<Modal bind:showModal={addPartnerModalOpen}>
		<h1 slot="header" class="font-semibold text-2xl">New Partner</h1>

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

		<Label id="avatar" label="Image/Avatar of partner" />
		<input
			accept="image/png, image/jpeg, image/gif"
			bind:files={imageFileList}
			id="avatar"
			name="avatar"
			type="file"
			multiple={false}
		/>

		{#if imageUploaded}
			<p class="font-semibold">Image to upload to CDN ({partner.image_type})</p>
			<img src={`data:image/${partner.image_type};base64,${imageBase64}`} alt="" />
		{/if}

		<ButtonReact
			color={Color.Themable}
			onClick={addPartner}
			icon="mdi:plus"
			text="Add Partner"
			states={{
				loading: 'Adding Partner...',
				success: 'Partner Added!',
				error: 'Failed to add Partner'
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
