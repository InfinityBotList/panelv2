<script lang="ts">
	import AuthBoundary from "../../components/AuthBoundary.svelte";
</script>

<AuthBoundary>
    <div class="flex flex-col h-screen border-themable-600">
        <slot />
    </div>
</AuthBoundary>