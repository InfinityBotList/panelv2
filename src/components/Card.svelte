<!--
    AnimatedBox is a box/card element that flips/animates when it becomes visible
-->

<script lang="ts">
    import Icon from "@iconify/svelte";
    import ButtonLink from "./ButtonLink.svelte";

    interface Button {
            text: string;
            href: string;
            disabled?: boolean;
    }

    export let title: string;
    export let button: Button | null = null;
    const titleCase = (str: string) => {
        return str.replace(/(^|\s)\S/g, function (t) {
            return t.toUpperCase()
        })
    };
</script>

<div
    class="card md:w-full lg:w-1/3 mb-5 mr-3 p-6 bg-white shadow-md rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
>
    <h5 class="mb-2 p-3 text-2xl font-bold tracking-tight">{title}</h5>
    <p class="mb-3 h-[10rem] overflow-y-scroll p-3 font-normal text-slate-50">
            <slot />
    </p>
    <slot name="post-slot">

    </slot>
    {#if button}
            <ButtonLink
                    link={button?.href}
                    disabled={button?.disabled}
                    showArrow={true}
            >
                    {button?.text}
            </ButtonLink>
    {/if}
</div>

<style>
    ::-webkit-scrollbar {
            -webkit-appearance: none;
            width: 7px;
    }
    ::-webkit-scrollbar-thumb {
            border-radius: 4px;
            background-color: #c0c5e5;
            box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
    }

    ::-webkit-scrollbar-thumb:active {
            background-color: rgb(168 85 247 / var(--tw-text-opacity));
    }
</style>