<script lang="ts">
  import MdCheck from 'svelte-icons/md/MdCheck.svelte'

  import FileUpload from '$components/FileUpload.svelte'

  import type { PageServerData } from './$types'

  export let data: PageServerData
</script>

<svelte:head>
  <title>Sharrr. Share end-to-end encrypted files.</title>
  <meta
    name="description"
    content="Pirates don't share, pirates sharrr. Share end-to-end encrypted files."
  />
  <meta
    name="keywords"
    content="pirates, share file, end-to-end encrypted file sharing, pirates sharrr, arrr"
  />
</svelte:head>

<section class="container mx-auto">
  <div class="relative pt-24 sm:pt-28 md:pt-30 lg:pt-40 px-6 lg:px-8">
    <h1 class="mb-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight sm:text-center ">
      <!-- One-time encrypted file transfer. -->
      Pretty secure file transfer.
    </h1>
    <p
      class="sm:mx-auto sm:max-w-sm md:max-w-xl mt-6 mb-8 md:mb-12 text-lg sm:text-xl md:text-2xl  text-gray-700 sm:text-center"
    >
      <!-- The most secure way to transfer data over the web. -->
      One-time, end-to-end encrypted file sharing for massive files.
    </p>

    <div class="mx-auto max-w-xl">
      <FileUpload baseUrl={data.vercelUrl} />
    </div>

    <div class="flex justify-center ">
      <div>
        <ul class="pt-8  text-gray-700 ">
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            Up to&nbsp;<strong>50GB</strong>&nbsp;files
          </li>
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            End-to-end encrypted (AES-GCM)
          </li>
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            Files stored in Switzerland 🇨🇭
          </li>
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            One-time download link
          </li>
        </ul>
        <div class="ml-8"><a href="/about">Learn more</a></div>
      </div>
    </div>
  </div>
</section>
