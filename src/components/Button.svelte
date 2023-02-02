<script lang="ts">
  const baseClass =
    'font-bold rounded-lg inline-flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2'
  const disabledClass = 'bg-gray-500 text-white pointer-events-none'
  let sizeClass = ''
  let variantClass = ''

  export let disabled: boolean = false
  export let href: string = ''
  export let size: 'small' | 'medium' | 'large' = 'medium'
  export let variant: 'primary' | 'default' = 'default'

  switch (variant) {
    case 'primary': {
      variantClass =
        'bg-primary text-white focus:ring-pink-600 hover:shadow-lg hover:shadow-black-200/10 transition-shadow'
      break
    }
    case 'default': {
      variantClass = 'bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-600'
      break
    }
  }

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

  $: buttonProps = {
    class: [
      baseClass,
      ...(disabled ? [disabledClass] : [variantClass]),
      sizeClass,
      $$restProps.class
    ].join(' ')
  }
</script>

{#if href}
  <a {href} {...$$restProps} {...buttonProps}>
    <slot />
  </a>
{:else}
  <button {disabled} on:click {...$$restProps} {...buttonProps}>
    <slot />
  </button>
{/if}
