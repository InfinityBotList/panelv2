<script lang="ts">
	import Icon from '@iconify/svelte';

	export let title: string;
	export let description: string;
</script>

<div class="h-auto w-full text-white lg:col-span-3 mt-24">
	<div
		class="h-auto top-20 transition-all duration-200 w-full bg-gray-500 bg-opacity-10 border border-red-700/50 rounded-lg p-4 lg:sticky"
	>
		<div class="bg-gradient-to-br text-white rounded-lg h-max">
			<p class="text-xl font-medium text-white text-center">
				<Icon inline={true} icon="fa-solid:info-circle" class="text-red-400 mr-2" />
				{title}
			</p>
			<p class="text-white text-sm text-opacity-80 text-center">{description}</p>
			<hr />
			<div class="mt-5 text-white"><slot /></div>
		</div>
	</div>
</div>
