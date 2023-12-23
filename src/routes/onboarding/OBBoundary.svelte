<script lang="ts">
	import { utf8ToHex } from "$lib/strings";
	import Loading from "../../components/Loading.svelte";
	import { obBoundary } from "./obBoundaryState";
    import ErrorComponent from "../../components/Error.svelte";
	import { persepolisUrl } from "./onboardingConsts";

    const login = () => {
        let url = window.location.toString()
        // Hex encode the URL
        url = utf8ToHex(url)

        // Redirect to the login page
        window.location.href = `${persepolisUrl}/create-login?state=create_session.${url}`
    }

    const checkToken = async () => {
        let searchParams = new URLSearchParams(window.location.search);

        if(!searchParams.get("token")) {
            // No token
            login()            
            return "No token found, logging in..."
        } else {
            let token = searchParams.get("token")

            let tokSplit = token?.split(".") || []

            if(tokSplit.length != 2) {
                // Invalid token
                login()
                return "Invalid token, logging in..."
            }

            let userId = tokSplit[0]
            let tokenBit = tokSplit[1]

            $obBoundary = {
                userId: userId,
                token: tokenBit
            }

            return false
        }
    }
</script>

{#await checkToken()}
    <Loading msg="Checking token..." />
{:then resp}
    {#if resp}
        <ErrorComponent msg={`Please wait: ${resp}`} />
    {:else}
        <slot />
    {/if}
{:catch error}
    <div>Something went wrong: {error.message}</div>
{/await}