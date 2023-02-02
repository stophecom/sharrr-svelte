<script lang="ts">
  import MdErrorOutline from 'svelte-icons/md/MdErrorOutline.svelte'

  let variantClass: string = ''
  let className: string = ''

  export { className as class }
  export let variant: 'info' | 'success' | 'warning' | 'error' = 'info'

  switch (variant) {
    case 'info': {
      variantClass = 'bg-white/70 text-info border-info'
      break
    }
    case 'success': {
      variantClass = 'bg-white/70 text-success border-success'
      break
    }
    case 'warning': {
      variantClass = 'bg-white/70 text-warning border-warning'
      break
    }
    case 'error': {
      variantClass = 'bg-white/70 text-error border-error'
      break
    }
  }
</script>

<div
  {...$$restProps}
  class="{className} {variantClass} flex items-center p-4 leading-normal border rounded-lg"
  role="alert"
>
  <div class="flex shrink-0 w-6 h-6 mr-2">
    <MdErrorOutline class="fill-current" />
  </div>
  <div>
    <slot />
  </div>
</div>
