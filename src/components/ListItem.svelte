<script lang="ts">
	export let class: string | null = "";
</script>

<li class="mb-2 border-gray-900 break-all break-words {class}">
	<slot />
</li>
