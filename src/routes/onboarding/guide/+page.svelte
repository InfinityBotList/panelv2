<script lang="ts">
	import Loading from "../../../components/Loading.svelte";
    import ObBoundary from "../OBBoundary.svelte";
	import { cdnUrl, htmlSanitizeUrl } from "../onboardingConsts";
    import ErrorComponent from "../../../components/Error.svelte";
	import type { Query } from "$lib/generated/htmlsanitize/Query";

    const fetchGuide = async () => {
        const guideFile = await fetch(`${cdnUrl}/staff/guide.md?n=${Date.now()}`)

        if(!guideFile.ok) throw new Error("Failed to fetch guide")

        const guideText = await guideFile.text()

        // HTMLSanitize it
        let hsq: Query = {
            SanitizeRaw: {
                body: guideText
            }
        }
        const guideHtml = await fetch(`${htmlSanitizeUrl}/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(hsq)
        })

        if(!guideHtml.ok) throw new Error("Failed to sanitize guide")

        const guideHtmlText = await guideHtml.text()

        return {
            text: guideHtmlText,
        }
    }
</script>

<ObBoundary>
    {#await fetchGuide()}
        <Loading msg="Fetching guide..." />
    {:then resp}
        <div class="desc px-3">
            {@html resp.text}
        </div>
    {:catch error}
        <ErrorComponent msg={`Something went wrong: ${error.message}`} />
    {/await}
</ObBoundary>
