<script lang="ts">
  import MdCheck from 'svelte-icons/md/MdCheck.svelte'
  import Button from '$components/Button.svelte'
  import { copyText } from '$lib/utils'

  export let text = ''

  let visible = false

  const copy = (e: MouseEvent) => {
    copyText(text)

    visible = true
    setTimeout(() => {
      const button = <HTMLButtonElement>e.target
      button.blur()
      visible = false
    }, 700)
  }
</script>

<div {...$$restProps} class="inline-flex relative {$$restProps?.class}">
  <Button data-testid="copy-link" class="uppercase" variant="primary" on:click={copy}>Copy</Button>
  <div
    role="tooltip"
    class="{visible
      ? 'opacity-1 visible'
      : 'opacity-0 invisible'} uppercase absolute z-10 bottom-1/2 left-1/2 translate-y-1/2 -translate-x-1/2 inline-block px-3 py-2 text-base font-medium text-white bg-primary rounded-lg  tooltip  transition-all ease-in-out"
  >
    <MdCheck />
  </div>
</div>
