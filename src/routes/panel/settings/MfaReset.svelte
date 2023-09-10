<script lang="ts">
	import { fetchClient } from '$lib/fetch';
	import { logoutUser } from '$lib/logout';
	import { panelAuthState } from '$lib/panelAuthState';
	import { error, success } from '$lib/toast';
	import ButtonReact from '../../../components/button/ButtonReact.svelte';
	import GreyText from '../../../components/GreyText.svelte';
	import InputText from '../../../components/inputs/InputText.svelte';
	import { Color } from '../../../components/button/colors';
	import type { PanelQuery } from '../../../utils/generated/arcadia/PanelQuery';

	let mfaOtp: string = '';

	const resetMfa = async () => {
		if (mfaOtp?.length != 6) {
			error('Please enter a valid 6-digit OTP');
			return false;
		}

		let lp: PanelQuery = {
			LoginResetMfa: {
				login_token: $panelAuthState?.loginToken || '',
				otp: mfaOtp
			}
		};

		let res: Response;
		try {
			res = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(lp)
			});
		} catch (e) {
			error('Failed to reset MFA');
			return false;
		}

		if (!res.ok) {
			error((await res.text()) || 'Failed to reset MFA');
			return false;
		}

		success('MFA reset successfully');
		logoutUser(false);
		return true;
	};
</script>

<h1 class="text-2xl font-semibold">Reset MFA</h1>

<GreyText
	>Reset Panel 2FA here. Note that you will need access to your current OTP in order to continue.</GreyText
>

<InputText
	id="otp"
	minlength={6}
	label="Enter OTP"
	description="Please open your authenticator app and enter the <span class='font-bold'>One-Time Password</span> you have recieved now!"
	placeholder="Code"
	bind:value={mfaOtp}
/>

<ButtonReact
	color={Color.Themable}
	icon={'mdi:key'}
	text={'Verify OTP & Reset MFA'}
	states={{
		loading: 'Resetting MFA...',
		success: 'Successfully reset MFA!',
		error: 'Failed to reset MFA'
	}}
	onClick={resetMfa}
/>
