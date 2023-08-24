<script lang="ts">
	import { onMount } from "svelte";

    onMount(() => {
        console.log(window, top)
        window?.opener?.postMessage("login", location.origin);
        return
    })
</script>