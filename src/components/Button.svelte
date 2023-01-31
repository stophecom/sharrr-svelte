<script lang="ts">
  let buttonBaseClass =
    'font-bold  rounded-lg inline-flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2'

  let buttonDefaultClass = 'bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-600'
  let buttonPrimaryClass =
    'bg-primary text-white focus:ring-pink-600 hover:shadow-lg hover:shadow-black-200/10 transition-shadow'

  let sizeClass = ''

  export let primary: boolean = false
  export let href: string = ''
  export let size: 'small' | 'medium' | 'large' = 'medium'

  switch (size) {
    case 'small': {
      sizeClass = 'py-2 px-4 text-sm'
      break
    }
    case 'medium': {
      sizeClass = 'py-4 px-6 text-base'
      break
    }
    case 'large': {
      sizeClass = 'py-6 px-8 text-lg'
      break
    }
  }

  let buttonProps = {
    class: [
      buttonBaseClass,
      ...(primary ? [buttonPrimaryClass] : [buttonDefaultClass]),
      sizeClass,
      $$restProps.class
    ].join(' ')
  }
</script>

{#if href}
  <a {href} {...buttonProps}>
    <slot />
  </a>
{:else}
  <button on:click on:mouseover on:mouseenter on:mouseleave {...buttonProps}>
    <slot />
  </button>
{/if}
