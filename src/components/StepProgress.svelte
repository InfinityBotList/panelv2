<script lang="ts">
	import { error } from '$lib/toast';
	import ButtonReact from './button/ButtonReact.svelte';
	import { Color } from './button/colors';

	interface Step {
		ID: number;
		Name: string;
		Current: boolean;
		Completed: boolean;
		AllowBack: boolean;
		Validate: () => boolean;
	}

	export let steps: Step[] = [];

	let currentStep: number;
	currentStep = steps.findIndex((step) => step.Current === true) || 0;

	const completeStep = async () => {
		if (currentStep + 1 === steps.length && steps[currentStep].Current === true) {
			steps[currentStep].Current = false;
			steps[currentStep].Completed = true;
			return true;
		} else return false;
	};

	const nextStep = async () => {
		const validate = steps[currentStep].Validate();

		if (validate === true) {
			if (currentStep < steps.length - 1) {
				steps[currentStep].Current = false;
				steps[currentStep].Completed = true;
				currentStep++;
				steps[currentStep].Current = true;
			} else if (currentStep === steps.length - 1 && !steps[currentStep].Completed) {
				steps[currentStep].Completed = true;
			}

			return true;
		} else {
			error('You have not finished this step. Ensure all fields are filled.');
			return false;
		}
	};

	const prevStep = async () => {
		if (currentStep > 0) {
			currentStep--;
			steps[currentStep].Current = true;
			steps[currentStep].Completed = false;
			steps[currentStep + 1].Current = false;
			return true;
		} else return false;
	};
</script>

<ol
	class="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base"
>
	{#each steps as Step}
		{#if Step.Completed}
			<li
				class="flex md:w-full items-center text-indigo-600 dark:text-indigo-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700"
			>
				<span
					class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500"
				>
					<svg
						aria-hidden="true"
						class="w-4 h-4 mr-2 sm:w-5 sm:h-5"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					{Step.Name}
				</span>
			</li>
		{:else if Step.Current}
			<li
				class="flex md:w-full items-center text-red-600 dark:text-red-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700"
			>
				<span
					class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500"
				>
					<svg
						aria-hidden="true"
						class="w-4 h-4 mr-2 sm:w-5 sm:h-5"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					{Step.Name}
				</span>
			</li>
		{:else}
			<li
				class="flex md:w-full items-center text-gray-600 dark:text-gray-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700"
			>
				<span
					class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500"
				>
					<svg
						aria-hidden="true"
						class="w-4 h-4 mr-2 sm:w-5 sm:h-5"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					{Step.Name}
				</span>
			</li>
		{/if}
	{/each}
</ol>

<div class="p-2" />

<slot />

<div class="p-2" />

<div
	class="grid justify-center items-center sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-4 mt-4"
>
	{#if steps[currentStep - 1 < 0 ? 0 : currentStep - 1].AllowBack && steps.length === currentStep + 1 && steps[currentStep].Completed === false}
		<ButtonReact
			color={Color.Themable}
			states={{
				loading: 'Transporting...',
				success: 'Transported!',
				error: 'Failed to transport to previous step!'
			}}
			onClick={prevStep}
			icon="mdi:send"
			text="Previous!"
		/>
	{/if}

	{#if steps.length != currentStep + 1}
		<ButtonReact
			color={Color.Themable}
			states={{
				loading: 'Transporting...',
				success: 'Transported!',
				error: 'Failed to transport to next step!'
			}}
			onClick={nextStep}
			icon="mdi:send"
			text="Next!"
		/>
	{/if}

	{#if steps.length === currentStep + 1 && steps[currentStep].Completed === false}
		<ButtonReact
			color={Color.Themable}
			states={{
				loading: 'Finishing RPC Action...',
				success: 'Finished RPC Action!',
				error: 'Failed to finish RPC Action!'
			}}
			onClick={completeStep}
			icon="mdi:send"
			text="Complete!"
		/>
	{/if}
</div>
