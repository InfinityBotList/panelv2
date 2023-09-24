import { panelQuery } from "$lib/fetch";
import { get } from "svelte/store";
import type { CdnAssetItem } from "../utils/generated/arcadia/CdnAssetItem";
import { panelAuthState } from "$lib/panelAuthState";

// The maximum size of a chunk of data to send to the server when adding new files
export const maxChunkSize = 1024 * 1024 * 4 // 4MB, for now

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
    onChunkPreUpload?: (range: [number, number], size: number, totalSize: number) => void
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

        if(options?.onChunkPreUpload) {
            options.onChunkPreUpload(range, chunk.size, data.size)
        }
        
        let chunkIdRes = await panelQuery({
            UploadCdnFileChunk: {
                login_token: get(panelAuthState)?.loginToken || "",
                chunk: chunkData,
            }
        })

        if(!chunkIdRes.ok) {
            throw new Error(`Failed to upload chunk: ${await chunkIdRes.text()}`)
        }

        let chunkId = await chunkIdRes.text()

        chunkIds.push(chunkId)
        offset += maxChunkSize

        if(options?.onChunkUploaded) {
            options.onChunkUploaded(chunkId, chunk.size, range, data.size)
        }
    }

    return chunkIds
}

export const sanitizeName = (name: string) => {
    // Replace the common unicode space with a normal space
    const UNICODE_REPLACEMENTS: [string | RegExp, string][] = [
        // Spaces
        [/\u00A0/g, " "],
        [/\u2007/g, " "],
        [/\u202F/g, " "],
        [/\uFEFF/g, " "],
        [/\u3000/g, " "],

        // Zero-width space
        [/\u200B/g, ""],

        // Hyphens
        [/\u2010/g, "-"],
        [/\u2011/g, "-"],
        [/\u2012/g, "-"],
        [/\u2013/g, "-"],
        [/\u2014/g, "-"],
        [/\u2015/g, "-"],
        [/\u2212/g, "-"],
        [/\uFE58/g, "-"],
        [/\uFE63/g, "-"],
        [/\uFF0D/g, "-"],   

        // Quotes
        [/\u2018/g, "'"],
        [/\u2019/g, "'"],
        [/\u201A/g, "'"],
        [/\u201B/g, "'"],
        [/\u201C/g, '"'],
        [/\u201D/g, '"'],
        [/\u201E/g, '"'],
        [/\u201F/g, '"'],
        [/\u2032/g, "'"],
        [/\u2033/g, '"'],
        [/\u2034/g, "''"],
        [/\u2035/g, "'"],
        [/\u2036/g, '"'],
        [/\u2037/g, "''"],
        [/\u2039/g, "'"],
        [/\u203A/g, "'"],
        [/\u275B/g, '"'],
        [/\u275C/g, '"'],
        [/\u275D/g, '"'],
        [/\u275E/g, '"'],
        [/\uFF02/g, '"'],
        [/\uFF07/g, "'"],
        [/\uFF62/g, '"'],
        [/\uFF63/g, '"'],
        
        // Brackets
        [/\u3008/g, "<"],
        [/\u3009/g, ">"],
        [/\uFE64/g, "<"],
        [/\uFE65/g, ">"],
        [/\uFF1C/g, "<"],
        [/\uFF1E/g, ">"],
        [/\uFF08/g, "("],
        [/\uFF09/g, ")"],
        [/\u3010/g, "["],
        [/\u3011/g, "]"],
        [/\uFF3B/g, "["],
        [/\uFF3D/g, "]"],
        [/\uFF5B/g, "{"],
        [/\uFF5D/g, "}"],
        [/\uFE59/g, "{"],
        [/\uFE5A/g, "}"],
        [/\uFE5B/g, "("],
        [/\uFE5C/g, ")"],
        [/\uFE5D/g, "("],
        [/\uFE5E/g, ")"],
        [/\u3014/g, "["],
        [/\u3015/g, "]"],
        [/\u3016/g, "["],
        [/\u3017/g, "]"],
        [/\u3018/g, "["],
        [/\u3019/g, "]"],
        [/\u301A/g, "["],
        [/\u301B/g, "]"],
        [/\u301C/g, "~"],
        [/\uFF5E/g, "~"],
        [/\u2026/g, "..."],
        [/\uFE19/g, "#"],
        [/\uFF03/g, "#"],
        [/\uFE30/g, "#"],
        [/\uFE6B/g, "#"],
        [/\uFF04/g, "$"],
        [/\uFE31/g, "$"],
        [/\uFE69/g, "$"],
        [/\uFF05/g, "%"],
        [/\uFE32/g, "%"],
        [/\uFE6A/g, "%"],
        [/\uFF06/g, "&"],
        [/\uFE33/g, "&"],
        [/\uFF07/g, "'"],
        [/\uFE34/g, "'"],
        [/\uFE4D/g, "'"],
        [/\uFF08/g, "("],
        [/\uFE35/g, "("],
        [/\uFF09/g, ")"],
        [/\uFE36/g, ")"],
        [/\uFE37/g, "*"],
        [/\uFF0A/g, "*"],
        [/\uFE38/g, "+"],
        [/\uFF0B/g, "+"],
        [/\uFE39/g, ","],
        [/\uFF0C/g, ","],
        [/\uFE3A/g, ";"],
        [/\uFF1B/g, ";"],
        [/\uFE3B/g, "<"],
        [/\uFF1C/g, "<"],
        [/\uFE3C/g, "="],
        [/\uFF1D/g, "="],
        [/\uFE3D/g, ">"],
        [/\uFF1E/g, ">"],
        [/\uFE3E/g, "?"],        
    ]

    for(let [regex, replacement] of UNICODE_REPLACEMENTS) {
        name = name.replace(regex, replacement)
    }

    // Remove all non-ascii characters
    name = name.replace(/[^\x00-\x7F]/g, "")

    return name
}