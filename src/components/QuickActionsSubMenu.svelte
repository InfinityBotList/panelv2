<script lang="ts">
	import { goto } from '$app/navigation';

	interface QuickOptions {
		name: string;
		description: string;
		link: string;
	}

	export let Options: QuickOptions[] | null;
	export let Open: boolean;
</script>

{#if Options}
	{#if Open}
		{#each Object(Options) as action}
			<button
				class="w-full border border-red-300 border-opacity-50 p-3 text-xl bg-black hover:bg-slate-800"
				on:click={() => {
					if (action.options != null) {
						if (Open) Open = false;
						else Open = true;
					} else goto(action.link);
				}}
			>
				{action.name}
				<small class="text-sm text-gray-400 block">{action.description}</small>
			</button>
		{/each}
	{/if}
{/if}
