<script lang="ts">
	import '../app.postcss';
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import Menubar from '../components/Menubar.svelte';
	import { onMount } from 'svelte';
	import logger from '$lib/logger';
	import { panelAuthState, type PanelAuthState } from '$lib/panelAuthState';
	import { panelState } from '$lib/panelData';
	import { goto } from '$app/navigation';
	import { sleep } from '$lib/time';
	import { page } from '$app/stores';
	import type { PanelQuery } from '../utils/generated/arcadia/PanelQuery';
	import type { AuthData } from '../utils/generated/arcadia/AuthData';
	import type { PanelUserDetails } from '../utils/generated/arcadia/PanelUserDetails';

	const options = {
	}

	let loadedLayout = false;
	let loadingMsg = 'Waiting for monkeys?'

	onMount(async () => {
		if($page.url.pathname == "/login") {
			loadedLayout = true
			return
		}

		if($page.url.pathname == '/login/authorize') {
			console.log(window, top)
			window?.opener?.postMessage("login", location.origin);
			loadingMsg = 'Please wait...'
			return
		};

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
			goto(`/login?redirect=${window.location.pathname}`)
			return
		}

		loadingMsg = "Validating your existence..."

		let lp: PanelQuery = {
			GetIdentity: {
				login_token: $panelAuthState?.loginToken || ''
			}
		}

		let resp = await fetch(`${$panelAuthState?.url}/query`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(lp)
		})

		if(!resp.ok) {
			logger.error("Panel", "Failed to get identity")
			loadingMsg = "Failed to auth data"
			return
		}

		let identity: AuthData = await resp.json()

		lp = {
			GetUserDetails: {
				user_id: identity.user_id
			}
		}

		let userDetailsResp = await fetch(`${$panelAuthState?.url}/query`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(lp)
		})

		if(!userDetailsResp.ok) {
			logger.error("Panel", "Failed to get user details")
			loadingMsg = "Failed to auth data"
			return
		}

		let userDetails: PanelUserDetails = await userDetailsResp.json()

		$panelState = {
			userId: identity.user_id,
			// @ts-ignore
			sessionCreatedAt: new Date(identity.created_at),
			userDetails: userDetails
		}

		loadedLayout = true;
	})
</script>

<div class="flex min-h-screen flex-col justify-between overflow-x-hidden bg-white dark:bg-gray-900">
	<header>
		<Menubar />
	</header>
	<main class="bg-white dark:bg-gray-900 text-black dark:text-white bg-contain p-4">
		{#if loadedLayout || $page.error}
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
	</main>
	<SvelteToast {options} />
	<footer class="mb-auto border-black">
		<p class="text-center text-gray-900 dark:text-gray-400 text-md font-semibold">
			&copy; 2023 Infinity Development
		</p>
	</footer>
</div>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>