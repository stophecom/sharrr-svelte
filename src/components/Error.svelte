<script lang="ts">
  let className: string = ''
  export let message: string = ''
  export { className as class }
</script>

<div class="{className} py-2 text-red-600">
  {message}
  <slot />
</div>
