<script lang="ts">
	import Icon from "@iconify/svelte";
	import FileElement from "./FileElement.svelte";
	import { cdnStateStore, cdnDataStore } from "./cdnStateStore";
	import Modal from "../../../../../components/Modal.svelte";
	import InputText from "../../../../../components/inputs/InputText.svelte";
	import ButtonReact from "../../../../../components/button/ButtonReact.svelte";
	import { Color } from "../../../../../components/button/colors";
	import { error } from "$lib/toast";
	import { panelQuery } from "$lib/fetch";
	import { panelAuthState } from "$lib/panelAuthState";
	import FileUpload from "../../../../../components/inputs/FileUpload.svelte";
	import { renderPreview, uploadFileChunks } from "$lib/fileutils";
	import OrderedList from "../../../../../components/OrderedList.svelte";
	import ListItem from "../../../../../components/ListItem.svelte";

    export let scope: string;

    enum Action {
        None,
        NewFolder,
        UploadFile,
        DeleteFolder
    }

    let openAction: Action = Action.None
    let showModal: boolean = false

    $: if(openAction == Action.None) {
        showModal = false
    }

    let newFolderName: string;
    const newFolder = async () => {
        if(!newFolderName) {
            error("Please enter a folder name")
            return false
        }

        let res = await panelQuery({
            UpdateCdnAsset: {
                login_token: $panelAuthState?.loginToken || "",
                cdn_scope: scope,
                path: $cdnStateStore.path,
                name: newFolderName,
                action: "CreateFolder"
            }
        })

        if(!res.ok) {
            let err = await res.text()
            error(`Failed to create folder: ${err}`)
            return false
        }

        setTimeout(() => {
            let newPath = `${$cdnStateStore.path}/${newFolderName}`

            if(newPath.startsWith("/")) {
                newPath = newPath.substring(1)
            }

            $cdnStateStore.path = newPath
        }, 1000)
        return true
    }

    let uploadFileName: string;
    let uploadFile: File;
    let uploadFileUploaded: boolean = false;
    let uploadFilePreviewBox: HTMLDivElement;
    let uploadFileStatus: string[] = [];
    let uploadFileChunkIds: string[];
    const addUploadFileStatus = (s: string) => {
		uploadFileStatus.push(s);
		uploadFileStatus = uploadFileStatus;
	};
    const uploadFileFunc = async () => {
        if(!uploadFile || !uploadFileUploaded) {
            error("Please upload a file")
            return false
        }

        addUploadFileStatus("Uploading file to CDN")

		// Calculate sha512 hash of the image
		addUploadFileStatus('=> Calculating file hash...');
		let hash = await crypto.subtle.digest(
			'sha-512',
			await uploadFile.arrayBuffer()
		);

		// Convert hash to hex
		let hashArray = Array.from(new Uint8Array(hash));
		let hashHex = hashArray
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');

        addUploadFileStatus(`=> Calculated image hash: ${hashHex}`);

		addUploadFileStatus('=> Uploading file chunks to CDN...');

        if(!uploadFileChunkIds?.length) {
            uploadFileChunkIds = await uploadFileChunks(uploadFile, {
			    onChunkUploaded: (chunkId, size, totalSize) => {
				    addUploadFileStatus(`=> Chunk ${chunkId} (${size} bytes) [${(size/totalSize) * 100}%]`);
			    },
		    })
        } else {
            addUploadFileStatus("=> Using cached chunk IDs")
        }

        addUploadFileStatus('=> Creating file with chunk IDs on CDN...');

		let upload = await panelQuery({
			UpdateCdnAsset: {
				login_token: $panelAuthState?.loginToken || '',
				path: $cdnStateStore.path,
				name: uploadFileName,
				action: {
					AddFile: {
						overwrite: false,
						chunks: uploadFileChunkIds,
						sha512: hashHex
					}
				},
				cdn_scope: scope
			}
		});

		if (!upload.ok) {
			let err = await upload.text();
			error(`Failed to upload image to CDN: ${err}`);
			return false;
		}

        addUploadFileStatus('=> Uploaded file to CDN');

        return true
    }

    let deleteFolderNonce: string;
    let deleteFolderInputtedNonce: string;
    const deleteFolder = async () => {
        if($cdnDataStore.files.length > 0 && deleteFolderNonce != deleteFolderInputtedNonce) {
            error("Nonce does not match")
            return false
        }

        let res = await panelQuery({
            UpdateCdnAsset: {
                login_token: $panelAuthState?.loginToken || "",
                cdn_scope: scope,
                path: $cdnStateStore.path,
                name: "",
                action: "Delete"
            }
        })

        if(!res.ok) {
            let err = await res.text()
            error(`Failed to delete folder: ${err}`)
            return false
        }

        setTimeout(() => {
            let pathSplit = $cdnStateStore.path.split("/")
            let path = pathSplit.slice(0, -1).join("/")

            $cdnStateStore.path = path
        }, 1000)
        return true
    }
</script>

<div id="action-box" class="mb-3 border rounded-md">
    <button 
        on:click={() => {
            openAction = Action.NewFolder
            showModal = true
        }}
        class="text-white hover:text-gray-300 focus:outline-none px-2 py-3 border-r"
    >
        <Icon icon={"mdi:plus"} class={"text-2xl inline-block align-bottom"} />
        New Folder
    </button> 

    <button 
        on:click={() => {
            openAction = Action.UploadFile
            showModal = true
        }}
        class="text-white hover:text-gray-300 focus:outline-none px-2 py-3 border-r"
    >
        <Icon icon={"mdi:file-upload"} class={"text-2xl inline-block align-bottom"} />
        Upload File
    </button> 

    <button 
        on:click={() => {
            deleteFolderNonce = Math.random().toString(36).substring(2, 15) + `@yesDelete${$cdnDataStore.files.length}Files`
            openAction = Action.DeleteFolder
            showModal = true
        }}
        class="hover:text-red-500 focus:outline-none px-2 py-3 border-r text-red-400"
    >
        <Icon icon={"mdi:trash-can"} class={"text-2xl inline-block align-bottom"} />
        Delete Folder
    </button> 

    {#if openAction == Action.NewFolder && showModal}
        <Modal bind:showModal>
            <h1 slot="header" class="font-semibold text-2xl">New Folder</h1>

            <form action="javascript:void(0">
                <InputText
                    id="new-folder-name"
                    label="Folder Name"
                    placeholder="Name of new folder"
                    minlength={1}
                    showErrors={false}
                    bind:value={newFolderName}   
                />

                <ButtonReact 
                    color={Color.Themable}
                    onClick={newFolder}
                    icon="mdi:plus"
                    text="Create Folder"
                    states={{
                        loading: "Creating folder...",
                        success: "Folder created!",
                        error: "Failed to create folder"
                    }}
                />
            </form>
        </Modal>
    {/if}

    {#if openAction == Action.UploadFile && showModal}
        <Modal bind:showModal>
            <h1 slot="header" class="font-semibold text-2xl">Upload File</h1>

            <FileUpload 
                id="upload-file"
                label="File to upload"
                bind:file={uploadFile}
                bind:fileName={uploadFileName}
                bind:fileUploaded={uploadFileUploaded}
                acceptableTypes={[]}
            /> 

            {#if uploadFileUploaded}
                <h2 class="text-xl font-semibold">Preview</h2>
                {#await renderPreview(async (_, file) => {
                    return uploadFile
                }, scope, {
                    name: uploadFileName,
                    path: $cdnStateStore.path,
                    size: BigInt(0),
                    last_modified: BigInt(0),
                    permissions: 0o644,
                    is_dir: false
                }, uploadFilePreviewBox)}
                    <Icon icon="mdi:loading" class="inline animate-spin text-2xl" />
                    <span class="text-xl">Loading Preview</span>
                {:catch err}
                    <p  class="text-red-500">{err?.toString()}</p>
                {/await}
                <div bind:this={uploadFilePreviewBox} />    
            {/if}

            <ButtonReact 
                color={Color.Themable}
                onClick={uploadFileFunc}
                icon="mdi:file-upload"
                text="Upload File"
                states={{
                    loading: "Uploading File...",
                    success: "File Uploaded!",
                    error: "Failed to upload file!"
                }}
            />

            {#if uploadFileStatus?.length > 0}
                <OrderedList>
                    {#each uploadFileStatus as s}
                        <ListItem>{s}</ListItem>
                    {/each}
                </OrderedList>
		    {/if}
        </Modal>
    {/if}

    {#if openAction == Action.DeleteFolder && showModal}
        <Modal bind:showModal>
            <h1 slot="header" class="font-semibold text-2xl">Delete Folder</h1>

            {#if $cdnDataStore.files.length > 0}
                <p class="mb-2">
                    Are you sure you want to delete the folder recursively at <span class="font-semibold">{$cdnStateStore.path}</span>?
                    <br /><br/>
                    A total of <span class="font-bold">{$cdnDataStore.files.length} files/folders WILL BE DELETED AS WELL. This action cannot be undone!</span>

                    To confirm, please type the following: <code class="select-none cursor-pointer"
                        >{deleteFolderNonce}</code
                    >
                </p>

                <InputText
                    id="delete-folder-nonce"
                    label="Nonce"
                    placeholder="Enter nonce"
                    minlength={1}
                    showErrors={false}
                    bind:value={deleteFolderInputtedNonce}   
                />
            {/if}

            <ButtonReact 
                color={Color.Red}
                onClick={deleteFolder}
                icon="mdi:trash-can"
                text="Delete Folder"
                states={{
                    loading: "Deleting folder...",
                    success: "Folder deleted!",
                    error: "Failed to delete folder"
                }}
            />
        </Modal>
    {/if}
</div>

<div id="file-box" class="border rounded-md">
    {#if $cdnStateStore.path}
        <button 
            class={`w-full text-left font-bold rounded-t-md block text-white hover:bg-slate-800 p-4 ${($cdnDataStore.files.length > 0) ? "border-b" : ""}`}
            on:click={() => {
                if($cdnStateStore.path.includes("/")) {
                    // Split by slash
                    let pSplit = $cdnStateStore.path.split("/")
                    $cdnStateStore.path = pSplit.slice(0, -1).join("/")
                } else {
                    $cdnStateStore.path = ""
                }
            }}
        >
            Parent Directory (../)
        </button>
    {/if}
    {#each $cdnDataStore.files as _, index}
        <FileElement {index} {scope} />   
    {/each}
</div>
