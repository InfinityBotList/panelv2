// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type VoteCreditTierAction = "ListTiers" | { "CreateTier": { 
/**
 * The ID of the tier
 */
id: string, 
/**
 * The target type of the tier
 */
target_type: string, 
/**
 * The position of the tier
 */
position: number, 
/**
 * The cents per vote
 */
cents: number, 
/**
 * The number of votes in this tier
 */
votes: number, } } | { "EditTier": { 
/**
 * The ID of the tier
 */
id: string, 
/**
 * The target type of the tier
 */
target_type: string, 
/**
 * The position of the tier
 */
position: number, 
/**
 * The cents per vote
 */
cents: number, 
/**
 * The number of votes in this tier
 */
votes: number, } } | { "DeleteTier": { 
/**
 * The ID of the tier
 */
id: string, } };