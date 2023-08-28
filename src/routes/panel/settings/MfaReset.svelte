<script lang="ts">
	import { fetchClient } from "$lib/fetch";
	import { logoutUser } from "$lib/logout";
	import { panelAuthState } from "$lib/panelAuthState";
	import { error, success } from "$lib/toast";
	import ButtonReact from "../../../components/ButtonReact.svelte";
	import GreyText from "../../../components/GreyText.svelte";
	import InputText from "../../../components/InputText.svelte";
	import type { PanelQuery } from "../../../utils/generated/arcadia/PanelQuery";

    let mfaOtp: string = '';

    const resetMfa = async () => {
        let lp: PanelQuery = {
            LoginResetMfa: {
                login_token: $panelAuthState?.loginToken || '',
                otp: mfaOtp
            }
        }

        let res = await fetchClient(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lp)
        })

        if (!res.ok) {
            error(await res.text() || 'Failed to reset MFA')
            return
        }

        success('MFA reset successfully')
        logoutUser(false)
    }
</script>

<h1 class="text-2xl font-semibold">Reset MFA</h1>

<GreyText>Reset Panel 2FA here. Note that you will need access to your current OTP in order to continue.</GreyText>

<InputText
    id="otp"
    minlength={6}
    label="Enter OTP"
    description="Please open your authenticator app and enter the <span class='font-bold'>One-Time Password</span> you have recieved now!"
    placeholder="Code"
    bind:value={mfaOtp}
/>

<ButtonReact onclick={resetMfa}>Reset MFA</ButtonReact>