<script lang="ts">
	import logger from '$lib/logger';
	import { panelAuthState, type PanelAuthState } from '$lib/panelAuthState';
	import { panelState, type PanelState } from '$lib/panelData';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PanelQuery } from '../utils/generated/arcadia/PanelQuery';
	import type { AuthData } from '../utils/generated/arcadia/AuthData';
	import Loading from './Loading.svelte';
	import { fetchClient, panelQuery } from '$lib/fetch';
	import ErrorComponent from './Error.svelte'

	let loadingMsg = 'Waiting for monkeys?';
	
	type CoreQuery = Record<keyof PanelState, (data: Record<string, any>) => PanelQuery>

	let coreQueries: CoreQuery = {
		auth: () => {
			return {
				GetIdentity: {
					login_token: $panelAuthState?.loginToken || ''
				}
			}
		},
		userDetails: (data: Record<string, any>) => {
			let authData: AuthData = data?.auth;
			return {
				GetUserDetails: {
					user_id: authData?.user_id || ''
				}
			}
		},
		userPerms: (data: Record<string, any>) => {
			let authData: AuthData = data?.auth;
			return {
				GetUserPerms: {
					user_id: authData?.user_id || ''
				}
			}
		},
		capabilities: () => {
			return {
				GetCapabilities: {
					login_token: $panelAuthState?.loginToken || ''
				}
			}
		},
		coreConstants: () => {
			return {
				GetCoreConstants: {
					login_token: $panelAuthState?.loginToken || ''
				}
			}
		},
		rpcSupportedTargetTypes: () => {
			return {
				GetRpcTargetTypes: {
					login_token: $panelAuthState?.loginToken || ''
				}
			}
		}
	};

	const setupState = async () => {
		if ($panelState) {
			return true;
		}

		let authorized = false;

		logger.info('Panel', 'Loading panel...');

		loadingMsg = 'Checking authentication';

		let panelStateData = localStorage.getItem('panelStateData');

		if (panelStateData) {
			try {
				let json: PanelAuthState = JSON.parse(panelStateData);
				$panelAuthState = json;

				switch ($panelAuthState?.sessionState) {
					case 'pending':
						goto(`/login/mfa?redirect=${window.location.pathname}`);
						return;
				}

				authorized = true;
			} catch (e) {
				logger.error('Panel', 'Failed to load panel state data from localStorage');

				if ($page.url.pathname != '/login') {
					await goto(`/login?redirect=${window.location.pathname}`);
				}
				return false;
			}
		}

		if (!authorized) {
			if ($page.url.pathname != '/login') {
				await goto(`/login?redirect=${window.location.pathname}`);
			}
			return false;
		}

		loadingMsg = 'Validating your existence...';

		let data: Record<string, any> = {}

		for(const key in coreQueries) {
			logger.info('Panel', `CoreQuery: fetch ${key}`);
			let query = coreQueries[key as keyof PanelState](data);

			let resp = await panelQuery(query)

			if (!resp.ok) {
				loadingMsg = await resp.text();
				throw new Error(loadingMsg)
			}

			let json = await resp.json();
			data[key] = json;
		}

		$panelState = data as PanelState

		setInterval(checkAuth, 1000 * 60 * 1);

		return true
	};

	const checkAuth = async () => {
		logger.info('Panel.CheckAuth', 'Checking auth...');

		try {
			let resp = await panelQuery({
				GetIdentity: {
					login_token: $panelAuthState?.loginToken || ''
				}
			})

			if (!resp.ok) {
				let err = await resp.text();
				logger.error('Panel.CheckAuth', err);
			}
		} catch (err) {
			logger.error('Panel.CheckAuth', err);
		}
	};
</script>

{#await setupState()}
	<Loading msg={loadingMsg} />
{:then res}
	{#if res}
		<slot />
	{:else}
		<Loading msg={"Just a moment..."} />
	{/if}
{:catch err}
	<ErrorComponent msg={loadingMsg} />
{/await}
