// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { RPCMethod } from "./RPCMethod";
import type { TargetType } from "./TargetType";

export type PanelQuery = { "GetLoginUrl": { version: number, redirect_url: string, } } | { "Login": { code: string, redirect_url: string, } } | { "LoginMfaCheckStatus": { login_token: string, } } | { "LoginActivateSession": { login_token: string, otp: string, } } | { "LoginResetMfa": { login_token: string, otp: string, } } | { "GetIdentity": { login_token: string, } } | { "GetUserDetails": { user_id: string, } } | { "GetUserPerms": { user_id: string, } } | { "GetCapabilities": { login_token: string, } } | { "GetCoreConstants": { login_token: string, } } | { "BotQueue": { login_token: string, } } | { "ExecuteRpc": { login_token: string, target_type: TargetType, method: RPCMethod, } };