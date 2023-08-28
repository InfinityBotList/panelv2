<script lang="ts">
	import type QueueActions from '$lib/comp_types/QueueActions';

	export let Actions: QueueActions[] = [];
	export let disabled: boolean = false;

	export let seperate: boolean = false;
	export let fullButton: boolean = false;
	export let open: boolean = false;

	const openDropdown = () => {
		if (open) open = false;
		else open = true;
	};
</script>

{#if disabled}
	<button
		disabled={true}
		aria-disabled={true}
		class="mb-2 inline-flex items-center py-2 px-3 text-center text-white bg-blue-600 hover:cursor-not-allowed rounded-md focus:ring-4 focus:outline-none focus:ring-blue-300"
	>
		<slot />
	</button>
{:else}
	<button
		class="flex justify-center {seperate
			? 'ml-3'
			: ''} hover:opacity-75 focus:outline-none mt-3 {fullButton ? 'w-full' : 'w-1/2'} {open
			? 'rounded-t-lg'
			: 'rounded-lg'} bg-black/90 p-3 text-center text-white"
		on:click={openDropdown}
	>
		<slot />

		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-6 h-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
			/>
		</svg>
	</button>

	<div
		class="{open ? 'flex' : 'hidden'} mt-1 focus:outline-none {fullButton
			? 'w-full'
			: 'w-1/2'} rounded-b-lg bg-black/90 h-40 text-center text-white"
	>
		<h2 class="mt-1 ml-4 text-white font-bold text-xl">Actions</h2>

		<select class="mt-16 ml-4 h-8 rounded-md text-black outline-none">
			{#each Actions as Action}
				<option value={Action.Name}>{Action.Name}</option>
			{/each}
		</select>
	</div>
{/if}
