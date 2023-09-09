<script lang="ts">
	import OrderedList from '../../components/OrderedList.svelte';
	import ListItem from '../../components/ListItem.svelte';
	import InputText from '../../components/InputText.svelte';
	import ButtonReact from '../../components/button/ButtonReact.svelte';
	import { error } from '$lib/toast';
	import { panelAuthState } from '$lib/panelAuthState';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PanelQuery } from '../../utils/generated/arcadia/PanelQuery';
	import type { InstanceConfig } from '../../utils/generated/arcadia/InstanceConfig';
	import { fetchClient } from '$lib/fetch';
	import logger from '$lib/logger';
	import { utf8ToHex } from '$lib/strings';
	import { Color } from '../../components/button/colors';

	onMount(() => {
		if ($panelAuthState) {
			goto('/');
		}
	});

	let instanceUrl = 'https://prod--panel-api.infinitybots.gg';

	const login = async () => {
		if(!instanceUrl) {
			error('Please enter an instance URL');
			return;
		}

		let redirectSearchParams = new URLSearchParams(window.location.search);

		let redirect = redirectSearchParams?.get('redirect');

		if (!redirect || !redirect.startsWith('/')) {
			redirect = '/';
		}

		let res = await fetchClient(instanceUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!res.ok) {
			error('Failed to get instance config');
			return;
		}

		let instanceConfig: InstanceConfig = await res.json();

		let url = instanceConfig?.instance_url;
		let queryPath = instanceConfig?.query;

		if (!url.startsWith('https://')) {
			url = `https://${url}`;
		}

		let lp: PanelQuery = {
			GetLoginUrl: {
				version: 1,
				redirect_url: `${window.location.origin}/login/authorize`
			}
		};

		res = await fetchClient(`${url}${queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});

		if (!res.ok) {
			error('Failed to get login URL');
			return;
		}

		let loginUrl = await res.text();

		let loginState: LoginState = {
			instanceUrl: url,
			queryPath,
			redirectUrl: redirect
		};

		loginUrl = `${loginUrl}&state=${utf8ToHex(JSON.stringify(loginState))}`;

		// Open login URL in new tab using window.open
		try {
			let loginTab = window.open(loginUrl, '_blank', 'popup');

			if (!loginTab) {
				throw new Error('No popups allowed');
			}

			loginTab?.focus();

			// Listen to message events
			window.addEventListener('message', async (e) => {
				// Check if the message is from the login tab
				if (e.source === loginTab) {
					loginTab?.close();
					goto(`/login/mfa?redirect=${redirect}`);
				}
			});
		} catch (err) {
			logger.error('Popups seem to be disabled, falling back to redirect auth');

			// Open login URL in current tab using goto
			await goto(loginUrl);
		}
	};
</script>

<article class="p-4">
	<h1 class="text-3xl font-semibold">Staff Login</h1>
	<p class="font-semibold text-lg">
		In order to login to the Arcadia instance, please input the 'Instance URL'.
		<br />
		<br />
		Note that the default instance URL is <code>https://prod--panel-api.infinitybots.gg</code> and should
		be valid. If you wish to use a custom instance URL, please change this URL here.
	</p>
	<OrderedList>
		<ListItem>
			See #info in the staff server to check the status of panel if Login does not work
		</ListItem>
		<ListItem>Copy-paste any special 'Instance URL' given to you here</ListItem>
	</OrderedList>
	<p class="font-semibold text-lg">And if you're not staff... then keep out!</p>

	<hr class="my-4" />

	<InputText
		bind:value={instanceUrl}
		id="url"
		label="Instance URL"
		placeholder="https://prod--panel-api.infinitybots.gg"
		minlength={1}
		showErrors={false}
	/>

	<ButtonReact
		color={Color.Themable}
		icon={"mdi:login"}
		text={"Login"}
		states={{
			loading: 'Contacting instance...',
			success: 'Redirecting you...',
			error: 'Failed to login'
		}}
		onClick={async () => {
			try {
				await login();
				return true
			} catch (err) {
				error(err?.toString() || 'Failed to login due to unknown error');
				return false
			}
		}} />
</article>
