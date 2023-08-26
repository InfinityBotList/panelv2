<script lang="ts">
	import '../app.postcss';
	import '$lib/styles/global.css';
	import "$lib/styles/mainsite/customColors.css";
	import "$lib/styles/mainsite/global.css"
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import Menubar from '../components/Menubar.svelte';

	const options = {};
</script>

<div data-theme="violet" class="flex min-h-screen flex-col justify-between overflow-x-hidden">
	<header>
		<Menubar />
	</header>

	<main class="text-white bg-contain px-4">
		<slot />
		<SvelteToast {options} />
	</main>

	<footer class="mb-auto border-white border-t-2">
		<p class="text-center text-white text-md font-semibold">
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
