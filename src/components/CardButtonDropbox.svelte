<script lang="ts">
	export let disabled: boolean = false;

	export let seperate: boolean = false;
	export let fullButton: boolean = false;
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
			: ''} hover:opacity-75 focus:outline-none mt-3 {fullButton
			? 'w-full'
			: 'w-1/2'} rounded-lg bg-black/90 p-3 text-center text-white"
		><slot />
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
{/if}
