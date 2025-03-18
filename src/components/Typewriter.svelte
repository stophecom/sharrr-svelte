<script lang="ts">
  import Typewriter from 'svelte-typewriter'

  export let message: string | undefined
</script>

<div class="truncate">
  <Typewriter mode="scramble" scrambleDuration={1400}>
    {message}
  </Typewriter>
</div>
