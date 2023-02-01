<script lang="ts">
  import Error from '$components/Error.svelte'
  import Page from '$components/Page.svelte'
  import { page } from '$app/stores'
</script>

<svelte:head>
  <title>Sharrr: Something went wrong.</title>
</svelte:head>

<Page title={'Ooops. '} subtitle={'Something went wrong.'}>
  <div class="flex justify-center">
    <Error>
      {$page?.error?.message}
    </Error>
  </div>
</Page>
