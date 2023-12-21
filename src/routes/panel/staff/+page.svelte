<script lang="ts">
	import type { QuickAction } from '../_core/QuickAction';
	import QuickMenuOption from '../_core/QuickMenuOption.svelte';

    let quickActions: QuickAction[] = [
        {
            name: 'Positions',
			description: 'View and/or manage the staff positions for the list',
			link: '/panel/staff/positions',
			enabled: () => true
        }
    ]
</script>

<h1 class="text-3xl font-semibold">
    Staff Management
</h1>

{#each quickActions as action, index}
    {#if action.enabled()}
        <QuickMenuOption {index} {action} actionsLength={quickActions.length} />
    {/if}
{/each}