// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { CreatePartner } from "./CreatePartner";

export type PartnerAction = "List" | { "Create": { partner: CreatePartner, } } | { "Update": { partner: CreatePartner, } } | { "Delete": { id: string, } };