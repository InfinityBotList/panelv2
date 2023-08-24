<!--Card made using tailwind-->

<script lang="ts">
	export let title: string;
</script>

<article
	class="w-full block p-6 m-3 md:w-1/2 sm:w-96 bg-white rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
>
	<h5 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white hover:cursor-pointer">
		{@html title}
	</h5>
	<hr class="mb-2 border-gray-400 dark:border-gray-400" />
	<p class="font-normal dark:text-white/90"><slot /></p>
</article>
