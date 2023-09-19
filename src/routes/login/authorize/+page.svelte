<script lang="ts">
	import Loading from '../../../components/Loading.svelte';
	import ErrorComponent from '../../../components/Error.svelte';
	import type { PanelQuery } from '../../../utils/generated/arcadia/PanelQuery';
	import { fetchClient, panelQuery } from '$lib/fetch';
	import { panelAuthState, type PanelAuthState } from '$lib/panelAuthState';
	import { goto } from '$app/navigation';
	import { hexToUtf8 } from '$lib/strings';

	let msg: string = 'Logging you in now...';

	const authorize = async () => {
		let searchParams = new URLSearchParams(window.location.search);

		let code = searchParams.get('code');

		if (!code) {
			throw new Error('Failed to get code from URL');
		}

		let state = searchParams.get('state');

		if (!state) {
			throw new Error('Failed to get state from URL');
		}

		let loginState: LoginState = JSON.parse(hexToUtf8(state));

		if (!loginState) {
			throw new Error('Failed to parse login state');
		}

		$panelAuthState = {
			url: loginState?.instanceUrl,
			queryPath: loginState?.queryPath,
			loginToken: '',
			sessionState: 'noSession'
		};

		let res = await panelQuery({
			Login: {
				code: code,
				redirect_url: `${window.location.origin}/login/authorize`
			}
		});

		if (!res.ok) {
			throw new Error((await res.text()) || 'Failed to login');
		}

		let loginToken = await res.text();

		let ps: PanelAuthState = {
			url: loginState?.instanceUrl,
			queryPath: loginState?.queryPath,
			loginToken,
			sessionState: 'pending'
		};

		localStorage.setItem('panelStateData', JSON.stringify(ps));

		if (window.opener) {
			window?.opener?.postMessage('login', location.origin);
		} else {
			goto(`/login/mfa?redirect=${loginState?.redirectUrl}`);
		}
	};
</script>

{#await authorize()}
	<Loading {msg} />
{:then}
	<Loading msg="Just one moment..." />
{:catch err}
	<ErrorComponent msg={err?.toString() || 'Unknown error occurred'} />
{/await}
