// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { AuthorizeAction } from "./AuthorizeAction";
import type { BlogAction } from "./BlogAction";
import type { CdnAssetAction } from "./CdnAssetAction";
import type { ChangelogAction } from "./ChangelogAction";
import type { PartnerAction } from "./PartnerAction";
import type { RPCMethod } from "./RPCMethod";
import type { StaffDisciplinaryTypeAction } from "./StaffDisciplinaryTypeAction";
import type { StaffMemberAction } from "./StaffMemberAction";
import type { StaffPositionAction } from "./StaffPositionAction";
import type { TargetType } from "./TargetType";

export type PanelQuery = { "Authorize": { version: number, action: AuthorizeAction, } } | { "Hello": { login_token: string, version: number, } } | { "GetUser": { login_token: string, user_id: string, } } | { "BotQueue": { login_token: string, } } | { "ExecuteRpc": { login_token: string, target_type: TargetType, method: RPCMethod, } } | { "GetRpcMethods": { login_token: string, filtered: boolean, } } | { "SearchEntitys": { login_token: string, target_type: TargetType, query: string, } } | { "UploadCdnFileChunk": { login_token: string, chunk: Array<number>, } } | { "ListCdnScopes": { login_token: string, } } | { "GetMainCdnScope": { login_token: string, } } | { "UpdateCdnAsset": { login_token: string, cdn_scope: string, name: string, path: string, action: CdnAssetAction, } } | { "UpdatePartners": { login_token: string, action: PartnerAction, } } | { "UpdateChangelog": { login_token: string, action: ChangelogAction, } } | { "UpdateBlog": { login_token: string, action: BlogAction, } } | { "UpdateStaffPositions": { login_token: string, action: StaffPositionAction, } } | { "UpdateStaffMembers": { login_token: string, action: StaffMemberAction, } } | { "UpdateStaffDisciplinaryType": { login_token: string, action: StaffDisciplinaryTypeAction, } } | { "PopplioStaff": { login_token: string, path: string, method: string, body: string, } };