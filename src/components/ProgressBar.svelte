<script lang="ts">
  export let label: string = 'Uploading…'
  export let fileName: string = ''
  export let progress: number = 0 // 0 - 100

  $: label = progress === 100 ? 'Done' : label
</script>

<div class="flex justify-between mb-1">
  <div class="flex flex-wrap items-baseline text-base dark:text-white max-w-full truncate">
    <span class="font-medium mr-2">{label}</span>
    {#if fileName}
      <div class="font-normal text-sm truncate text-gray-700">{fileName}</div>
    {/if}
  </div>
  <span class="flex-shrink-0 ml-2 w-14 text-right text-sm font-medium text-primary dark:text-white"
    >{progress.toFixed(2)}%</span
  >
</div>
<div class="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-700">
  <div class="bg-primary h-2.5 rounded-full" style="min-width: 3%; width: {progress}%" />
</div>
