<script lang="ts">
	import '../app.postcss';
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import Menubar from '../components/Menubar.svelte';
	import { page } from '$app/stores';
	import AuthBoundary from '../components/AuthBoundary.svelte';

	const options = {
	}
</script>

<div class="flex min-h-screen flex-col justify-between overflow-x-hidden bg-white dark:bg-gray-900">
	<header>
		<Menubar />
	</header>
	<main class="bg-white dark:bg-gray-900 text-black dark:text-white bg-contain px-4">
		{#if $page.error}
			<slot />
		{:else}
			<AuthBoundary>
				<div class="flex flex-col h-screen border-themable-600">
					<slot />
				</div>
			</AuthBoundary>
		{/if}
	</main>
	<SvelteToast {options} />
	<footer class="mb-auto border-black border-t-2">
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