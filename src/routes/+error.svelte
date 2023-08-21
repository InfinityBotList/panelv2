<script>
    import { page } from '$app/stores';
  </script>
  
  <h1 class="font-semibold text-center text-5xl">{$page.status}</h1>
  {#if $page.error && $page.error.message}
    <h2 class="font-semibold text-center text-4xl">{$page.error.message}</h2>
  {:else}
  <h2 class="font-semibold text-center text-4xl">{$page.error}</h2>
  {/if}
  <p class="text-center italic text-xl font-semibold">It sure does look like you're lost or doing something wrong or messed up...</p>