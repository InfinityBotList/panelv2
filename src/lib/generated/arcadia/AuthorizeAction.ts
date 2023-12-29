// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type AuthorizeAction =
	| { Begin: { scope: string; redirect_url: string } }
	| { CreateSession: { code: string; redirect_url: string } }
	| { CheckMfaState: { login_token: string } }
	| { ResetMfaTotp: { login_token: string; otp: string } }
	| { ActivateSession: { login_token: string; otp: string } }
	| { Logout: { login_token: string } };
