<script lang="ts">
  import MdErrorOutline from 'svelte-icons/md/MdErrorOutline.svelte'

  let className: string = ''
  export { className as class }
</script>

<div
  class="{className} flex items-center p-4 leading-normal text-success bg-white/70 border border-success rounded-lg"
  role="alert"
>
  <div class="flex shrink-0 w-6 h-6 mr-2">
    <MdErrorOutline class="fill-current" />
  </div>
  <slot />
</div>
