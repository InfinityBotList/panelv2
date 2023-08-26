<!--Tailwind menubar-->

<script lang="ts">
	import { panelAuthState } from '$lib/panelAuthState';

	function onClickMenu() {
		console.log('clicked');

		const menu = document.getElementById('menu');

		if (menu) {
			menu.classList.toggle('hidden');
		}
	}
</script>

<nav class="border-gray-200 px-2 sm:px-4 rounded">
	<div class="flex flex-wrap justify-between items-center mx-auto">
		<a href="/" class="flex items-center">
			<img
				src="https://cdn.infinitybots.gg/images/png/Infinity.png"
				class="mr-3 h-6 sm:h-9"
				alt="IBL Logo"
			/>
			<span class="self-center text-xl font-semibold whitespace-nowrap text-white"
				>Infinity Panel</span
			>
		</a>
		<button
			on:click={onClickMenu}
			type="button"
			class="inline-flex items-center p-2 ml-3 text-sm text-gray-200 hover:text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
			aria-controls="navbar-default"
			aria-expanded="false"
		>
			<span class="sr-only">Open main menu</span>
			<svg
				class="w-6 h-6"
				aria-hidden="true"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
				><path
					fill-rule="evenodd"
					d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
					clip-rule="evenodd"
				/></svg
			>
		</button>
	</div>
</nav>

<!--Menu for mobile users-->

<div id="menu" class="hidden">
	<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
		<a
			href="/"
			class="block px-3 py-2 text-base font-medium text-gray-200 hover:text-black rounded-md hover:bg-gray-50"
			>Home</a
		>
		{#if $panelAuthState?.loginToken}
			<button
				class="text-left w-full block px-3 py-2 text-base font-medium text-gray-200 hover:text-black rounded-md hover:bg-gray-50"
				on:click={() => {
					localStorage.clear();
					window.location.reload();
				}}>Logout</button
			>
		{/if}
	</div>
</div>
