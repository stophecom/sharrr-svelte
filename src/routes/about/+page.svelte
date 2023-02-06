<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown'

  import ship from '$lib/images/ship.svg'
  import Page from '$components/Page.svelte'
  import readme from './about.md?raw'
</script>

<svelte:head>
  <title>Sharrr - About</title>
  <meta name="description" content="Learn more about the technical implementation." />
</svelte:head>

<Page title={'About'} subtitle={`Most people share, smart people sharrr.`} isContainer={false}>
  <div class="container mx-auto relative">
    <img
      class="absolute bottom-full right-0 w-24 h-24 md:w-40 md:h-40"
      src={ship}
      alt="Pirates don't share, pirates sharrr."
    />
    <div class="mx-auto px-6 lg:px-8 prose sm:rounded-xl bg-white/70 py-6 sm:shadow-md">
      <SvelteMarkdown source={readme} />
    </div>
  </div>
</Page>
