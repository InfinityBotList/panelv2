<script lang="ts">
	import { utf8ToHex } from "$lib/strings";
	import Loading from "../../components/Loading.svelte";
	import { obBoundary, type OBBoundary } from "./obBoundaryState";
    import ErrorComponent from "../../components/Error.svelte";
	import { persepolisUrl } from "./onboardingConsts";
	import type { AuthData } from "$lib/generated/persepolis/AuthData";
	import logger from "$lib/logger";

    const login = () => {
        localStorage?.setItem("obCurrentUrl", window?.location?.toString())

        let finalPath = utf8ToHex(`${window?.location?.origin}/onboarding/authorize`)

        // Redirect to the login page
        window.location.href = `${persepolisUrl}/create-login?state=create_session.${finalPath}`
    }

    const checkToken = async () => {
        logger.info("OBBoundary", "Checking token")
        if (localStorage?.getItem("obBoundary")) {
            let obBoundaryData = JSON.parse(localStorage.getItem("obBoundary") || "{}")

            let res = await fetch(`${persepolisUrl}/auth-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    login_token: obBoundaryData?.token
                })
            })

            if(!res.ok) {
                // Invalid token
                login()
                return "Invalid token, logging in..."
            }

            let authData: AuthData = await res.json()

            $obBoundary = {
                token: obBoundaryData?.token,
                authData,
            }
            return false
        }

        let searchParams = new URLSearchParams(window.location.search);

        if(!searchParams.get("token")) {
            // No token
            login()            
            return "No token found, logging in..."
        } else {
            let token = searchParams.get("token")

            localStorage.setItem("obBoundary", JSON.stringify({
                token: token
            }))

            window.location.href = localStorage.getItem("obCurrentUrl") || "/"

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
    <div>Something went wrong: {error?.message}</div>
{/await}