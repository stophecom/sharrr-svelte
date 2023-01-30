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
  <div class="mx-auto prose rounded-xl bg-white/50 px-4 py-5">
    <SvelteMarkdown source={readme} />
  </div>
</Page>
