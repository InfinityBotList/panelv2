// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { StaffDisciplinaryType } from "./StaffDisciplinaryType";

export type StaffDisciplinary = { 
/**
 * The ID of the position
 */
id: string, 
/**
 * The user ID who recieved of the disciplinary action
 */
user_id: string, 
/**
 * When the staff disciplinary action was created/added
 */
created_at: string, 
/**
 * When the disciplinary action expires, in seconds
 */
expires_at: bigint | null, 
/**
 * The title of the disciplinary action report
 */
title: string, 
/**
 * The description of the disciplinary action report
 */
description: string, 
/**
 * The type of the disciplinary
 */
type: StaffDisciplinaryType, };