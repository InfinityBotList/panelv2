<script lang="ts">
	import OrderedList from '../../components/OrderedList.svelte';
	import ListItem from '../../components/ListItem.svelte';
	import InputText from '../../components/inputs/InputText.svelte';
	import ButtonReact from '../../components/button/ButtonReact.svelte';
	import { error } from '$lib/toast';
	import { panelAuthState } from '$lib/panelAuthState';
	import { onMount } from 'svelte';
	import { goto as gotoOnce } from '$app/navigation';
	import type { InstanceConfig } from '$lib/generated/arcadia/InstanceConfig';
	import { panelQuery } from '$lib/fetch';
	import logger from '$lib/logger';
	import { utf8ToHex } from '$lib/strings';
	import { Color } from '../../components/button/colors';
	import Modal from '../../components/Modal.svelte';
	import { panelLoginProtocolVersion } from '$lib/constants';

	// Safari needs this patch here
	let navigating: boolean = false;
	const goto = async (url: string) => {
		if(navigating) return new Promise(() => {});
		navigating = true;
		return await gotoOnce(url);
	}

	onMount(async () => {
		if ($panelAuthState) {
			await goto('/');
		}
	});

	let instanceUrl = 'https://prod--panel-api.infinitybots.gg';
	let showModal = false;
	let modalInstanceConfig: InstanceConfig | null = null

	const login = async () => {
		if (!instanceUrl) {
			error('Please enter an instance URL');
			return false;
		}

		if (!instanceUrl?.startsWith('https://') && !instanceUrl?.startsWith('http://localhost') && !instanceUrl?.startsWith('http://127.0.0.1')) {
			error('Instance URL must either be HTTPS or localhost');
			return false;
		}

		$panelAuthState = {
			url: instanceUrl,
			loginToken: '',
			sessionState: 'noSession'
		};

		let res = await panelQuery({
			Hello: {
				version: panelLoginProtocolVersion
			}
		});

		if (!res.ok) {
			error('Failed to connect to instance');
			return false;
		}

		let instanceConfig: InstanceConfig = await res.json();
		modalInstanceConfig = instanceConfig;

		if(instanceConfig?.warnings?.length > 0) {
			showModal = true;
			return true;
		} else {
			return await confirmLogin();
		}
	};

	const confirmLogin = async () => {
		let res = await panelQuery({
			GetLoginUrl: {
				version: panelLoginProtocolVersion,
				redirect_url: `${window.location.origin}/login/authorize`
			}
		});

		if (!res.ok) {
			error('Failed to get login URL');
			return false;
		}

		let loginUrl = await res.text();

		let redirectSearchParams = new URLSearchParams(window.location.search);
		let redirect = redirectSearchParams?.get('redirect');
		if (!redirect || !redirect.startsWith('/')) {
			redirect = '/';
		}

		let loginState: LoginState = {
			instanceUrl,
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
					await goto(`/login/mfa?redirect=${redirect}`);
				}
			});
		} catch (err) {
			logger.error('Popups seem to be disabled, falling back to redirect auth');

			// Open login URL in current tab using goto
			await goto(loginUrl);
		}

		return true;
	}
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
		icon={'mdi:login'}
		text={'Login'}
		states={{
			loading: 'Contacting instance...',
			success: 'Moving you along...',
			error: 'Failed to login'
		}}
		onClick={login}
	/>
</article>

{#if showModal && modalInstanceConfig}
	<Modal
		bind:showModal
	>
		<h1 slot="header" class="font-semibold text-2xl">Login</h1>
		<OrderedList>
			{#each modalInstanceConfig.warnings as warning}
				<ListItem>{warning}</ListItem>
			{/each}
		</OrderedList>
		<ButtonReact 
			color={Color.Themable}
			icon={'mdi:login'}
			text={'Login'}
			states={{
				loading: 'Contacting instance...',
				success: 'Redirecting you...',
				error: 'Failed to login'
			}}
			onClick={confirmLogin}
		/>
	</Modal>
{/if}