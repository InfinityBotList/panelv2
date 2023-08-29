<script lang="ts">
	import { onMount } from 'svelte';

	import logger from '$lib/logger';
	import { panelAuthState, type PanelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelData';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PanelQuery } from '../utils/generated/arcadia/PanelQuery';
	import type { AuthData } from '../utils/generated/arcadia/AuthData';
	import type { PartialUser } from '../utils/generated/arcadia/PartialUser';
	import type { PanelPerms } from '../utils/generated/arcadia/PanelPerms';
	import type { Capability } from '../utils/generated/arcadia/Capability';
	import Loading from './Loading.svelte';
	import type { CoreConstants } from '../utils/generated/arcadia/CoreConstants';
	import { fetchClient } from '$lib/fetch';

	let loadingMsg = 'Waiting for monkeys?';
	let error = false;

	const setupState = async () => {
		if ($panelState) {
			return;
		}

		try {
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
					return;
				}
			}

			if (!authorized) {
				if ($page.url.pathname != '/login') {
					await goto(`/login?redirect=${window.location.pathname}`);
				}
				return;
			}

			loadingMsg = 'Validating your existence...';

			let lp: PanelQuery = {
				GetIdentity: {
					login_token: $panelAuthState?.loginToken || ''
				}
			};

			let resp = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(lp)
			});

			if (!resp.ok) {
				loadingMsg = await resp.text();
				error = true;
				return;
			}

			let identity: AuthData = await resp.json();

			lp = {
				GetUserDetails: {
					user_id: identity.user_id
				}
			};

			let userDetailsResp = await fetchClient(
				`${$panelAuthState?.url}${$panelAuthState?.queryPath}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(lp)
				}
			);

			if (!userDetailsResp.ok) {
				loadingMsg = await resp.text();
				error = true;
				return;
			}

			let userDetails: PartialUser = await userDetailsResp.json();

			lp = {
				GetUserPerms: {
					user_id: identity.user_id
				}
			};

			let userPermsResp = await fetchClient(
				`${$panelAuthState?.url}${$panelAuthState?.queryPath}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(lp)
				}
			);

			if (!userPermsResp.ok) {
				loadingMsg = await resp.text();
				error = true;
				return;
			}

			let userPerms: PanelPerms = await userPermsResp.json();

			lp = {
				GetCapabilities: {
					login_token: $panelAuthState?.loginToken || ''
				}
			};

			let capabilitiesResp = await fetchClient(
				`${$panelAuthState?.url}${$panelAuthState?.queryPath}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(lp)
				}
			);

			if (!capabilitiesResp.ok) {
				loadingMsg = await resp.text();
				error = true;
				return;
			}

			let capabilities: Capability[] = await capabilitiesResp.json();

			lp = {
				GetCoreConstants: {
					login_token: $panelAuthState?.loginToken || ''
				}
			};

			let coreConstantsResp = await fetchClient(
				`${$panelAuthState?.url}${$panelAuthState?.queryPath}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(lp)
				}
			);

			if (!coreConstantsResp.ok) {
				loadingMsg = await resp.text();
				error = true;
				return;
			}

			let coreConstants: CoreConstants = await coreConstantsResp.json();

			$panelState = {
				userId: identity.user_id,
				// @ts-ignore
				sessionCreatedAt: new Date(identity.created_at),
				userDetails,
				userPerms,
				capabilities,
				coreConstants
			};
		} catch (err) {
			loadingMsg = (await err?.toString()) || 'Unknown error';
			error = true;
			return;
		}

		setInterval(checkAuth, 1000 * 60 * 1);
	};

	const checkAuth = async () => {
		logger.info('Panel.CheckAuth', 'Checking auth...');

		let lp: PanelQuery = {
			GetIdentity: {
				login_token: $panelAuthState?.loginToken || ''
			}
		};

		try {
			let resp = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(lp)
			});

			if (!resp.ok) {
				let err = await resp.text();
				logger.error('Panel.CheckAuth', err);
			}
		} catch (err) {
			logger.error('Panel.CheckAuth', err);
		}
	};

	onMount(setupState);
</script>

{#if $panelState}
	<slot />
{:else}
	<Loading msg={loadingMsg} />
{/if}
