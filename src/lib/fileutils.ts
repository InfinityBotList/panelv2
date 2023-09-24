import { fetchClient, panelQuery } from "$lib/fetch";
import { get } from "svelte/store";
import type { CdnAssetItem } from "../utils/generated/arcadia/CdnAssetItem";
import { panelAuthState } from "$lib/panelAuthState";

// The maximum size of a chunk of data to send to the server when adding new files
export const maxChunkSize = 100 * 1024 // 100KB, for now

// Reads the file contents from the server
export const loadData = async (scope: string, file: CdnAssetItem) => {
    // Remove any slash prefix
    let path = file.path
    if(path.startsWith("/")) {
        path = path.slice(1)
    }

    // Remove filename from path
    let pathSplit = path.split("/")
    pathSplit.pop()

    // Join path back together
    path = pathSplit.join("/")

    let res = await panelQuery({
        UpdateCdnAsset: {
            login_token: get(panelAuthState)?.loginToken || "",
            cdn_scope: scope || "",
            path: path,
            name: file.name,
            action: "ReadFile"
        }
    })     
    
    if(!res.ok) {
        let err = await res.text()
        throw new Error(`Failed to read file: ${err}`)
    }

    let data = await res.blob()
    return data
}

export const renderPreview = async (loadData: (scope: string, file: CdnAssetItem) => Promise<Blob>, scope: string, file: CdnAssetItem, previewBox: HTMLDivElement) => {
    // Clear previewBox
    previewBox.innerHTML = ""
    
    if(!file.name.includes(".")) {
        throw new Error("No preview available for this file (no extension)")
    }

    let ext = file.name.split(".").pop()

    if(!ext) {
        throw new Error("No preview available for this file (no extension)")
    }

    let data: Blob;

    switch (ext) {
        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
        case "webp":
            data = await loadData(scope, file)

            let img = document.createElement("img")
            img.src = URL.createObjectURL(data)
            img.classList.add("max-w-full", "max-h-full", "bg-white")
            if(previewBox) {
                previewBox.appendChild(img)
            }
            break;
        case "svg":
            data = await loadData(scope, file)
            let text = await data.text()
            var parser = new DOMParser();
            var doc = parser.parseFromString(text, "image/svg+xml");
            doc.documentElement.classList.add("max-w-full", "max-h-full", "bg-white")
            if(previewBox) {
                previewBox.appendChild(doc.documentElement)
            }
            break;
        case "json":
            data = await loadData(scope, file)

            let indentedJson: string = await data.text()

            try {
                indentedJson = JSON.stringify(JSON.parse(indentedJson), null, 2)
            } catch (e) {
                indentedJson = `Failed to parse JSON: ${e}\n\n${indentedJson}`
            }

            let json = document.createElement("pre")
            json.innerText = indentedJson
            json.classList.add("max-w-full", "h-full")
            if(previewBox) {
                previewBox.appendChild(json)
            }
            break;
        default:
            throw new Error("No preview available for this file (unsupported file type/extension)")
    }
}

// Options for buffered chunk upload
export interface UploadChunkOptions {
    onChunkPreUpload?: (chunkId: string, range: [number, number], size: number, totalSize: number) => void
    onChunkUploaded?: (chunkId: string, size: number, range: [number, number], totalSize: number) => void
}

// Uploads a blob to the server returning the list of chunk IDs
export const uploadFileChunks = async (data: Blob, options?: UploadChunkOptions) => {
    let chunkIds: string[] = []

    // Keep reading chunks of maxChunkSize until we reach the end of the file
    let offset = 0

    while(offset < data.size) {
        let chunk: Blob
        let range: [number, number]
        if(offset + maxChunkSize <= data.size) {
            range = [offset, offset + maxChunkSize]
            chunk = data.slice(offset, offset + maxChunkSize)
        } else {
            range = [offset, data.size]
            chunk = data.slice(offset)
        }

        // Convert chunk to a byte array without using Buffer
        let chunkData = Array.from(new Uint8Array(await chunk.arrayBuffer()))
        
        let chunkIdRes = await panelQuery({
            CreateFileChunk: {
                login_token: get(panelAuthState)?.loginToken || "",
            }
        })

        if(!chunkIdRes.ok) {
            throw new Error(`Failed to create chunk: ${await chunkIdRes.text()}`)
        }

        let chunkId = await chunkIdRes.text()

        if(options?.onChunkPreUpload) {
            options.onChunkPreUpload(chunkId, range, chunk.size, data.size)
        }

        // Upload chunk
        let res = await fetchClient(`${get(panelAuthState)?.url}${get(panelAuthState)?.queryPath}/cdnUploadChunk/${chunkId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(chunkData)
        })

        if(!res.ok) {
            throw new Error(`Failed to upload chunk: ${await res.text()}`)
        }

        chunkIds.push(chunkId)
        offset += maxChunkSize

        if(options?.onChunkUploaded) {
            options.onChunkUploaded(chunkId, chunk.size, range, data.size)
        }
    }

    return chunkIds
}