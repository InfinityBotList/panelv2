// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { BlogAction } from "./BlogAction";
import type { CdnAssetAction } from "./CdnAssetAction";
import type { ChangelogAction } from "./ChangelogAction";
import type { PartnerAction } from "./PartnerAction";
import type { RPCMethod } from "./RPCMethod";
import type { TargetType } from "./TargetType";

export type PanelQuery = { "Hello": { version: number, } } | { "GetLoginUrl": { version: number, redirect_url: string, } } | { "Login": { code: string, redirect_url: string, } } | { "LoginMfaCheckStatus": { login_token: string, } } | { "LoginActivateSession": { login_token: string, otp: string, } } | { "LoginResetMfa": { login_token: string, otp: string, } } | { "Logout": { login_token: string, } } | { "GetIdentity": { login_token: string, } } | { "GetUserDetails": { user_id: string, } } | { "GetUserPerms": { user_id: string, } } | { "GetCoreConstants": { login_token: string, } } | { "BotQueue": { login_token: string, } } | { "ExecuteRpc": { login_token: string, target_type: TargetType, method: RPCMethod, } } | { "GetRpcMethods": { login_token: string, filtered: boolean, } } | { "GetRpcTargetTypes": { login_token: string, } } | { "SearchEntitys": { login_token: string, target_type: TargetType, query: string, } } | { "UploadCdnFileChunk": { login_token: string, chunk: Array<number>, } } | { "ListCdnScopes": { login_token: string, } } | { "GetMainCdnScope": { login_token: string, } } | { "UpdateCdnAsset": { login_token: string, cdn_scope: string, name: string, path: string, action: CdnAssetAction, } } | { "UpdatePartners": { login_token: string, action: PartnerAction, } } | { "UpdateChangelog": { login_token: string, action: ChangelogAction, } } | { "UpdateBlog": { login_token: string, action: BlogAction, } } | { "PopplioStaff": { login_token: string, path: string, method: string, body: string, } };