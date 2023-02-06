<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown'

  import Page from '$components/Page.svelte'
  import readme from './about.md?raw'
</script>

<svelte:head>
  <title>Sharrr - About</title>
  <meta name="description" content="Learn more about the technical implementation." />
</svelte:head>

<Page title={'About'} subtitle={`Most people share, smart people sharrr.`} isContainer={false}>
  <div class="container mx-auto">
    <div class="mx-auto px-6 lg:px-8 prose sm:rounded-xl bg-white/70 py-6">
      <SvelteMarkdown source={readme} />
    </div>
  </div>
</Page>
