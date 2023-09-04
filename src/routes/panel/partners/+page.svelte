<script lang="ts">
	import { panelState } from '$lib/panelData';
</script>

<div class="mt-14">
	<h1 class="text-3xl font-semibold">
		Welcome Back, {$panelState?.userDetails?.display_name}!
	</h1>

	<p>Pretty empty right now, isn't it?</p>
</div>
