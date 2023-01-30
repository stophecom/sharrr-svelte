<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown'

  import Page from '$components/Page.svelte'
  import readme from './about.md?raw'
</script>

<svelte:head>
  <title>About</title>
  <meta name="description" content="About this app" />
</svelte:head>

<Page title={'About'} subtitle={`Pirates don't share, pirates sharrr.`}>
  <div class="mx-auto prose rounded-xl sm:bg-white/50 sm:px-6 py-6">
    <SvelteMarkdown source={readme} />
  </div>
</Page>
