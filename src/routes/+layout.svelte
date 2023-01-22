<script lang="ts">
  import Header from './Header.svelte'
  import Footer from './Footer.svelte'
  import '../app.css'
</script>

<div class="app">
  <Header />

  <main>
    <slot />
  </main>

  <Footer />
</div>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
