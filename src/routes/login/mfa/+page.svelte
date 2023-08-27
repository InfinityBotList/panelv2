<script lang="ts">
	import { goto } from '$app/navigation';
	import logger from '$lib/logger';
	import { panelAuthState, type PanelAuthState } from '$lib/panelAuthState';
	import { onMount } from 'svelte';
	import type { PanelQuery } from '../../../utils/generated/arcadia/PanelQuery';
	import ErrorComponent from '../../../components/Error.svelte';
	import Loading from '../../../components/Loading.svelte';
	import type { MfaLogin } from '../../../utils/generated/arcadia/MfaLogin';
	import InputText from '../../../components/InputText.svelte';
	import ButtonReact from '../../../components/ButtonReact.svelte';
	import { error as errorToast } from '$lib/toast';
	import { fetchClient } from '$lib/fetch';

	let msg: string = 'Loading MFA...';

	let inputtedCode: string = '';

	const redirect = () => {
		let searchParams = new URLSearchParams(window.location.search);

		let redirect = searchParams.get('redirect');

		return redirect || '/panel';
	};

	const loadMfa = async () => {
		let panelStateData = localStorage.getItem('panelStateData');

		if (!panelStateData) {
			await goto(`/login?redirect=${redirect()}`);
			return;
		}

		try {
			let json: PanelAuthState = JSON.parse(panelStateData);
			$panelAuthState = json;

			if ($panelAuthState?.sessionState != 'pending') {
				goto(redirect());
				return;
			}
		} catch (e) {
			logger.error('Panel', 'Failed to load panel state data from localStorage');
			await goto(`/login?redirect=${redirect()}`);
			return;
		}

		let lp: PanelQuery = {
			LoginMfaCheckStatus: {
				login_token: $panelAuthState?.loginToken || ''
			}
		};

		let res = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});

		if (!res.ok) {
			let err = await res.text();
			throw new Error(err);
		}

		return await res.json();
	};

	const authorizeMfa = async () => {
		if (inputtedCode?.length != 6) {
			errorToast('Please enter a valid 6-digit OTP');
			return;
		}

		let lp: PanelQuery = {
			LoginActivateSession: {
				login_token: $panelAuthState?.loginToken || '',
				otp: inputtedCode
			}
		};

		let res = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(lp)
		});

		if (!res.ok) {
			let err = await res.text();
			errorToast(err);
			return;
		}

		localStorage.setItem(
			'panelStateData',
			JSON.stringify({
				...$panelAuthState,
				sessionState: 'active'
			})
		);

		await goto(redirect());
	};

	onMount(loadMfa);
</script>

{#await loadMfa()}
	<Loading {msg} />
{:then mfaData}
	<article class="p-4">
		<h1 class="text-3xl font-semibold">MFA</h1>

		{#if mfaData?.info}
			<h2 class="text-xl font-semibold">First Time Setup</h2>
			<p class="mt-3 mb-3">Scan the below QR code:</p>
			{@html mfaData?.info?.qr_code}
			<p class="mt-3 mb-5">
				...or use the following secret in your Authenticator app:
				<code class="break-words break-all">
					{mfaData?.info?.secret}
				</code>
			</p>
		{/if}

		<InputText
			id="otp"
			minlength={6}
			label="Enter OTP"
			description="Please open your authenticator app and enter the OTP you have recieved now!"
			placeholder="Code"
			bind:value={inputtedCode}
		/>

		<ButtonReact onclick={authorizeMfa}>Verify OTP</ButtonReact>
	</article>
{:catch e}
	<ErrorComponent msg={e?.toString() || 'Unknown error'} />
{/await}