// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type RPCMethod =
	| { Claim: { target_id: string; force: boolean } }
	| { Unclaim: { target_id: string; reason: string } }
	| { Approve: { target_id: string; reason: string } }
	| { Deny: { target_id: string; reason: string } }
	| { Unverify: { target_id: string; reason: string } }
	| { PremiumAdd: { target_id: string; reason: string; time_period_hours: number } }
	| { PremiumRemove: { target_id: string; reason: string } }
	| { VoteBanAdd: { target_id: string; reason: string } }
	| { VoteBanRemove: { target_id: string; reason: string } }
	| { VoteReset: { target_id: string; reason: string } }
	| { VoteResetAll: { reason: string } }
	| { ForceRemove: { target_id: string; reason: string; kick: boolean } }
	| { CertifyAdd: { target_id: string; reason: string } }
	| { CertifyRemove: { target_id: string; reason: string } }
	| { BotTransferOwnershipUser: { target_id: string; reason: string; new_owner: string } }
	| { BotTransferOwnershipTeam: { target_id: string; reason: string; new_team: string } };
