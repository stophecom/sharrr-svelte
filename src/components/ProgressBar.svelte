<script lang="ts">
  export let label: string = 'Uploading…'
  export let fileName: string = ''
  export let progress: number = 0

  $: label = progress === 100 ? 'Done' : label
</script>

<div class="flex justify-between mb-1">
  <div class="text-base dark:text-white">
    <span class="font-medium">{label}</span>
    {#if fileName}
      <span class="ml-1 font-normal">{fileName}</span>
    {/if}
  </div>
  <span class="text-sm font-medium dark:text-white">{progress.toFixed(2)}%</span>
</div>
<div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
  <div class="bg-primary h-2.5 rounded-full" style="min-width: 3%; width: {progress}%" />
</div>
