<script lang="ts">
	import { panelState } from "$lib/panelData";
	import AuthBoundary from "../../components/AuthBoundary.svelte";
</script>

<AuthBoundary>
    <div class="border-themable-600">
        <slot />
    </div>
</AuthBoundary>