import type { Field, FieldFetch, Capability } from "./types"

export const fetchFields = (cap: Capability, ff: FieldFetch) => {
    let fields: Field[] = []
    for(let field of ff) {
        if(field instanceof Function) {
            let f = field as (cap: Capability) => Field
            fields.push(f(cap))
            continue
        }
        fields.push(field as Field)
    }

    return fields
}

export const cast = <T>(v: any): T => {
    return v as T
}

export const castToArray = <T>(v: any): T[] => {
    return cast<any[]>(v)
}