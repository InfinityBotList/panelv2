// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export interface PartialServer {
	server_id: string;
	name: string;
	avatar: string;
	total_members: number;
	online_members: number;
	short: string;
	type: string;
	votes: number;
	invite_clicks: number;
	clicks: number;
	nsfw: boolean;
	tags: Array<string>;
	premium: boolean;
	claimed_by: string | null;
	last_claimed: string | null;
	mentionable: Array<string>;
}
