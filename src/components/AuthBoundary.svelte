<script lang="ts">
	import { onMount } from 'svelte';

	import logger from '$lib/logger';
	import { panelAuthState, type PanelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelData';
	import { goto } from '$app/navigation';
	import { sleep } from '$lib/time';
	import { page } from '$app/stores';
	import type { PanelQuery } from '../utils/generated/arcadia/PanelQuery';
	import type { AuthData } from '../utils/generated/arcadia/AuthData';
	import type { PartialUser } from '../utils/generated/arcadia/PartialUser';
	import type { PanelPerms } from '../utils/generated/arcadia/PanelPerms';
	import type { Capability } from '../utils/generated/arcadia/Capability';
	import Loading from './Loading.svelte';
	import type { CoreConstants } from '../utils/generated/arcadia/CoreConstants';

	let loadingMsg = 'Waiting for monkeys?';

	const setupState = async () => {
		if ($panelState) {
			return;
		}

		try {
			let authorized = false;

			logger.info('Panel', 'Loading panel...');

			// To ensure CLS is low
			await sleep(1000);

			loadingMsg = 'Checking authentication';

			let panelStateData = localStorage.getItem('panelStateData');

			if (panelStateData) {
				try {
					let json: PanelAuthState = JSON.parse(panelStateData);
					$panelAuthState = json;
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

			let resp = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(lp)
			});

			if (!resp.ok) {
				let err = await resp.text();

				if (err == 'identityExpired') {
					loadingMsg = 'Your session has expired, logging you out';

					await sleep(2000);
				}

				localStorage.clear();

				logger.error('Panel', 'Failed to get identity');

				window.location.reload();
				return;
			}

			let identity: AuthData = await resp.json();

			lp = {
				GetUserDetails: {
					user_id: identity.user_id
				}
			};

			let userDetailsResp = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(lp)
			});

			if (!userDetailsResp.ok) {
				logger.error('Panel', 'Failed to get user details');

				if ($page.url.pathname != '/login') {
					await goto(`/login?redirect=${window.location.pathname}`);
				}
				return;
			}

			let userDetails: PartialUser = await userDetailsResp.json();

			lp = {
				GetUserPerms: {
					user_id: identity.user_id
				}
			};

			let userPermsResp = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(lp)
			});

			if (!userPermsResp.ok) {
				logger.error('Panel', 'Failed to get user perms');

				if ($page.url.pathname != '/login') {
					await goto(`/login?redirect=${window.location.pathname}`);
				}
				return;
			}

			let userPerms: PanelPerms = await userPermsResp.json();

			lp = {
				GetCapabilities: {
					login_token: $panelAuthState?.loginToken || ''
				}
			};

			let capabilitiesResp = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(lp)
			});

			if (!capabilitiesResp.ok) {
				logger.error('Panel', 'Failed to get capabilities');

				if ($page.url.pathname != '/login') {
					await goto(`/login?redirect=${window.location.pathname}`);
				}
				return;
			}

			let capabilities: Capability[] = await capabilitiesResp.json();

			lp = {
				GetCoreConstants: {
					login_token: $panelAuthState?.loginToken || ''
				}
			};

			let coreConstantsResp = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(lp)
			});

			if (!coreConstantsResp.ok) {
				logger.error('Panel', 'Failed to get core constants');

				if ($page.url.pathname != '/login') {
					await goto(`/login?redirect=${window.location.pathname}`);
				}
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
		} catch {
			logger.error('Panel', 'Failed to load panel');
			if ($page.url.pathname != '/login') {
				await goto(`/login?redirect=${window.location.pathname}`);
			}
			return;
		}
	};

	onMount(setupState);
</script>

{#if $panelState}
	<slot />
{:else}
	<Loading msg={loadingMsg} />
{/if}
