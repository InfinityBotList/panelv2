<script lang="ts">
	import { onMount } from "svelte";

	import logger from '$lib/logger';
	import { panelAuthState, type PanelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelData';
	import { goto } from '$app/navigation';
	import { sleep } from '$lib/time';
	import { page } from '$app/stores';
	import type { PanelQuery } from '../utils/generated/arcadia/PanelQuery';
	import type { AuthData } from '../utils/generated/arcadia/AuthData';
	import type { PanelUserDetails } from '../utils/generated/arcadia/PanelUserDetails';
    import { navigating } from '$app/stores';

	let loaded = false;
	let loadingMsg = 'Waiting for monkeys?';

    const setupState = async () => {
        if($panelAuthState) {
            loaded = true
        }
 
        if($page.url.pathname == '/login/authorize') {
			console.log(window, top)
			window?.opener?.postMessage("login", location.origin);
			loadingMsg = 'Please wait...'
			return
		};

        try {
            let authorized = false;

            logger.info("Panel", "Loading panel...")

            // To ensure CLS is low
            await sleep(1000);

            if($page.error) {
                loadingMsg = 'Failed to load panel'
                return;
            }

            loadingMsg = 'Checking authentication'

            let panelStateData = localStorage.getItem("panelStateData");

            if(panelStateData) {
                try {
                    let json: PanelAuthState = JSON.parse(panelStateData);
                    $panelAuthState = json;
                    authorized = true;
                } catch(e) {
                    logger.error("Panel", "Failed to load panel state data from localStorage");
                    loadingMsg = "Failed to load panel"
                    return
                }
            }

            // This serves as a sample delay for how long a fetch will take once that is added
            await sleep(2000);

            if(!authorized) {
                await goto(`/login?redirect=${window.location.pathname}`)
                loaded = true;
                return
            }

            loadingMsg = "Validating your existence..."

            let lp: PanelQuery = {
                GetIdentity: {
                    login_token: $panelAuthState?.loginToken || ''
                }
            }
            
            let resp = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(lp)
            })

            if(!resp.ok) {
                logger.error("Panel", "Failed to get identity")
                await goto(`/login?redirect=${window.location.pathname}`)
                loaded = true
                return
            }

            let identity: AuthData = await resp.json()

            lp = {
                GetUserDetails: {
                    user_id: identity.user_id
                }
            }

            let userDetailsResp = await fetch(`${$panelAuthState?.url}${$panelAuthState?.queryPath}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(lp)
            })

            if(!userDetailsResp.ok) {
                logger.error("Panel", "Failed to get user details")
                await goto(`/login?redirect=${window.location.pathname}`)
                loaded = true
                return
            }

            let userDetails: PanelUserDetails = await userDetailsResp.json()

            $panelState = {
                userId: identity.user_id,
                // @ts-ignore
                sessionCreatedAt: new Date(identity.created_at),
                userDetails: userDetails
            }

            loaded = true;
        } catch {
            logger.error("Panel", "Failed to load panel")
            $panelAuthState = null
            await goto(`/login?redirect=${window.location.pathname}`)
            loaded = true
            return

        }
    }

    onMount(setupState)

    $: if($navigating?.from?.url != $navigating?.to?.url) {
        logger.info("Panel", "Navigating, checking auth state", $navigating)
        if(!$panelAuthState) {
            loaded = false;
            setupState()
        }
    }
</script>

{#if loaded}
    <slot />
{:else}
    <section class="text-black">
        <h3 aria-live="polite" class="text-center text-6xl font-semibold p-10">Welcome to Infinity Panel</h3>
        <svg aria-labelledby="___panelLoad" class="ml-auto mr-auto text-center animate-spin h-48 w-48" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle class="path" fill="transparent" stroke-width="6.5" cx="33" cy="33" r="30" stroke="url(#gradient)" />
                <linearGradient id="gradient">
                    <stop offset="1%" stop-color="#42d179" stop-opacity="1"/>
                    <stop offset="80%" stop-color="#42d179" stop-opacity="0"/>
                </linearGradient>
            <title id="___panelLoad">Loading the panel, please wait</title>
        </svg>	
        <p class="mt-3 text-4xl font-semibold text-center">{loadingMsg}</p>
    </section>
{/if}