<script lang="ts">
  import Header from '$components/Header.svelte'
  import Footer from '$components/Footer.svelte'
  import '../app.css'
</script>

<svelte:head>
  <script defer data-domain="sharrr.com" src="https://plausible.io/js/script.js"></script>
</svelte:head>

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
    background: radial-gradient(circle, rgb(255 255 255) 0%, rgb(190 199 212) 100%);
    min-height: 100vh;
  }
</style>
