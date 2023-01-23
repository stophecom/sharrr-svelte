<script lang="ts">
  import Header from '$components/Header.svelte'
  import Footer from '$components/Footer.svelte'
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
    background: rgb(255, 255, 255);
    background: radial-gradient(circle, rgb(255 255 255) 0%, rgb(234 228 244) 100%);
  }
</style>
