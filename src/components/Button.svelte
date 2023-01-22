<script lang="ts">
  let buttonBaseClass =
    ' font-bold py-2 px-4 rounded inline-flex items-center focus:outline-none focus:ring-2  focus:ring-offset-2'

  let buttonDefaultClass = 'bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-600'
  let buttonPrimaryClass = 'bg-pink-500 hover:bg-pink-500 text-white focus:ring-pink-600'

  export let primary: boolean = false

  let buttonProps = {
    class: [
      buttonBaseClass,
      ...(primary ? [buttonPrimaryClass] : [buttonDefaultClass]),
      $$restProps.class
    ].join(' ')
  }
</script>

<button on:click on:mouseover on:mouseenter on:mouseleave {...buttonProps}>
  <slot />
</button>
