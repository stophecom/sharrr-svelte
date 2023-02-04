<script lang="ts">
  import Typewriter from 'svelte-typewriter'

  $: show = !!message

  function typewriter(node: Node, speed = 5) {
    const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE

    if (!valid) {
      throw new Error(`This transition only works on elements with a single text node child`)
    }

    const text = node.textContent
    if (!text?.length) {
      throw new Error(`Text node is empty.`)
    }
    const duration = text.length / (speed * 0.01)

    return {
      duration,
      tick: (t: number) => {
        const i = Math.trunc(text.length * t)
        node.textContent = text.slice(0, i)
      }
    }
  }
  export let message: string | undefined
</script>

<div class="truncate">
  <Typewriter mode="scramble" scrambleDuration={1400}>
    {message}
  </Typewriter>
</div>
