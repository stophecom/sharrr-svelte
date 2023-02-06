<script lang="ts">
  export let title: string = 'Page Title'
  export let subtitle: string = 'Page Subtitle'
  export let isContainer: boolean = true
</script>

<section class="flex items-center">
  <div class="relative pt-20 sm:pt-28 pb-12">
    <div class="container mx-auto px-6 lg:px-8">
      <h1 class="mb-5 text-5xl sm:text-5xl md:text-6xl font-bold tracking-tight sm:text-center ">
        {title}
      </h1>
      <p
        class="sm:mx-auto max-w-xs sm:max-w-sm md:max-w-xl mt-6 mb-8 md:mb-12 text-2xl sm:text-2xl text-gray-700 sm:text-center"
      >
        {subtitle}
      </p>
    </div>
    {#if isContainer}
      <div class="container mx-auto px-6 lg:px-8">
        <slot />
      </div>
    {:else}
      <slot />
    {/if}
  </div>
</section>
