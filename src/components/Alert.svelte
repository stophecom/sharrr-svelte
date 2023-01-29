<script lang="ts">
  import MdErrorOutline from 'svelte-icons/md/MdErrorOutline.svelte'

  let className: string = ''
  export { className as class }
</script>

<div
  class="{className} flex items-center p-4 leading-normal text-indigo-600 bg-indigo-50 border border-indigo-500 rounded-lg"
  role="alert"
>
  <div class="inline w-6 h-6 mr-2">
    <MdErrorOutline class="fill-current" />
  </div>
  <slot />
</div>
