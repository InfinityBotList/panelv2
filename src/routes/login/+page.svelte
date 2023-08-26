<script lang="ts">
	import OrderedList from '../../components/OrderedList.svelte';
	import ListItem from '../../components/ListItem.svelte';
	import InputText from '../../components/InputText.svelte';
	import ButtonReact from '../../components/ButtonReact.svelte';
	import { error } from '$lib/toast';
	import { panelAuthState, type PanelAuthState } from '$lib/panelAuthState';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PanelQuery } from '../../utils/generated/arcadia/PanelQuery';
	import type { InstanceConfig } from '../../utils/generated/arcadia/InstanceConfig';

	onMount(() => {
		if ($panelAuthState) {
			goto('/');
		}
	});

	let instanceUrl = 'https://prod--panel-api.infinitybots.gg';

	const login = async () => {
		let res = await fetch(instanceUrl, {
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
				version: 0,
				redirect_url: `${window.location.origin}/login/authorize`
			}
		};

		res = await fetch(`${url}${queryPath}`, {
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

		// Open login URL in new tab using window.open
		let loginTab = window.open(loginUrl, '_blank');

		// Listen to message events
		window.addEventListener('message', async (e) => {
			// Check if the message is from the login tab
			if (e.source === loginTab) {
				loginTab?.close();

				// Get URL from message
				let urlSearchParams = new URLSearchParams(loginTab?.location.search || '');

				let code = urlSearchParams.get('code');

				if (!code) {
					error('Failed to get code from login URL');
					return;
				}

				let lp: PanelQuery = {
					Login: {
						code: code,
						redirect_url: `${window.location.origin}/login/authorize`
					}
				};

				let res = await fetch(`${url}${queryPath}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(lp)
				});

				if (!res.ok) {
					let err = await res.text();
					error(err || 'Failed to login');
					return;
				}

				let loginToken = await res.text();

				let ps: PanelAuthState = {
					url,
					queryPath,
					loginToken
				};

				localStorage.setItem('panelStateData', JSON.stringify(ps));

				let redirect = urlSearchParams.get('redirect');

				if (!redirect || !redirect.startsWith('/')) {
					redirect = '/';
				}

				window.location.href = redirect;
			}
		});
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
	/>

	<ButtonReact onclick={() => login()}>Login</ButtonReact>
</article>
