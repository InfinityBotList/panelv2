import logger from "$lib/logger"
import type { Field, FieldFetch, Capability } from "./types"

export const fetchFields = (cap: Capability, ff: FieldFetch) => {
    let fields: Field[] = []
    logger.info("FetchFields", cap, ff)
    for(let field of ff) {
        if(!field) {
            continue
        }

        if(field instanceof Function) {
            let f = field as (cap: Capability) => Field | null
            let fCap = f(cap)

            if(!fCap) {
                continue
            }

            fields.push(fCap)
            continue
        }
        fields.push(field as Field)
    }

    return fields
}

export const validateDataWithFields = (data: any, fields: Field[]) => {
    let fieldSet = new Set(fields.map(f => f.id))
    let dataKeySet = new Set(Object.keys(data))

    // Get the difference between the field set and the data key set
    let fs_minus_dks = new Set([...fieldSet].filter(x => !dataKeySet.has(x)))
    let dks_minus_fs = new Set([...dataKeySet].filter(x => !fieldSet.has(x)))

    // If the schema is strict, then we should error if there are any keys in the data that are not in the schema
    if(fs_minus_dks.size > 0) {
        throw new Error(`Data contains keys that are not in the schema: ${Array.from(fs_minus_dks).join(", ")}`)
    }

    // If the schema is strict, then we should error if there are any keys in the schema that are not in the data
    if(dks_minus_fs.size > 0) {
        throw new Error(`Schema contains keys that are not in the data: ${Array.from(dks_minus_fs).join(", ")}`)
    }
}

export const cast = <T>(v: any): T => {
    return v as T
}

export const castToArray = <T>(v: any): T[] => {
    return cast<any[]>(v)
}