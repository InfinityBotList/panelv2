<script lang="ts">
    import Loading from '../../../../components/Loading.svelte';
    import ErrorComponent from '../../../../components/Error.svelte';
	import { page } from "$app/stores";
	import { fetchClient } from "$lib/fetch";
	import type { CreateQuizResponse } from "$lib/generated/persepolis/CreateQuizResponse";
	import OnboardingBoundary from "../../OnboardingBoundary.svelte";
	import { obBoundary } from "../../obBoundaryState";
	import { persepolisUrl } from "../../onboardingConsts";
	import InputText from '../../../../components/inputs/InputText.svelte';
	import InputTextArea from '../../../../components/inputs/InputTextArea.svelte';
	import Select from '../../../../components/inputs/select/Select.svelte';
	import { success } from '$lib/toast';
	import ButtonReact from '../../../../components/button/ButtonReact.svelte';
	import { Color } from '../../../../components/button/colors';
	import type { OnboardResponse } from '$lib/generated/persepolis/OnboardResponse';
	import type { PlatformUser } from '$lib/generated/arcadia/PlatformUser';
	import ObjectRender from '../../../../components/ObjectRender.svelte';

    const minShortAnswerLength = 50;
    const minLongAnswerLength = 750

    const fetchOnboardingResponse = async () => {
        let resp = await fetchClient(`${persepolisUrl}/onboarding-response`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: $page?.params?.id || '',
				login_token: $obBoundary?.token
			})
		});

        if(!resp.ok) {
            let err = await resp.text();
            throw new Error(err?.toString() || 'An unknown error occurred while loading the onboarding response');
        }

        let obResponse: OnboardResponse = await resp.json();

        return obResponse
    }
</script>

<OnboardingBoundary>
	{#await fetchOnboardingResponse()}
		<Loading msg="Fetching onboarding response..." />
	{:then resp}
        <article class="p-4">
            <h1 class="text-3xl font-semibold text-white">Onboarding Response for {resp?.user_id}</h1>

            {#each (resp?.questions || []) as question, i}
                {#if question.data == "short"}
                    <InputText 
                        id={`question-${i}`}
                        label={question.question}
                        placeholder={"This is a short answer question!"}
                        disabled={true}
                        required={true}
                        minlength={minShortAnswerLength}
                        value={resp?.answers?.[question?.question] || ''}
                    />
                {:else if question.data == "long"}
                    <InputTextArea
                        id={`question-${i}`}
                        label={question.question}
                        placeholder={"This is a looooong answer question, so answer wisely!"}
                        disabled={true}
                        required={true}
                        minlength={minLongAnswerLength}
                        value={resp?.answers?.[question?.question] || ''}
                    />
                {:else if question.data.multiple_choice}
                    <Select 
                        id={`question-${i}`}
                        label={question.question}
                        disabled={true}
                        required={true}
                        value={resp?.answers?.[question?.question] || ''}
                        choices={[
                            ...question.data['multiple_choice'].map((option, i) => {
                                return {
                                    id: i.toString(),
                                    label: option,
                                    value: option
                                }
                            })
                        ]}
                    />

                    <small class="text-white mb-1">Available Options: {question?.data?.multiple_choice.join(", ")}</small>
                {/if}
            {/each}

            <hr class="mt-10" />
            
            {#if resp?.verdict}
                <h1 class="text-2xl font-semibold text-white">Verdict</h1>
                <ObjectRender 
                    object={resp?.verdict}
                />
            {/if}

            <details class="mb-4 text-white">
                <summary class="text-white hover:cursor-pointer">Debug</summary>
                <div class="overflow-x-scroll">
                    <pre>{JSON.stringify(resp, null, '\t')}</pre>
                </div>
            </details>
        </article>
    {:catch error}
        <ErrorComponent msg={error} />
    {/await}
</OnboardingBoundary>