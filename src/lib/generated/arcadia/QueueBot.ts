// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { PartialUser } from "./PartialUser";

export interface QueueBot { bot_id: string, client_id: string, user: PartialUser, claimed_by: string | null, approval_note: string, short: string, mentionable: Array<string>, invite: string, }