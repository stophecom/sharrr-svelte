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
  <div class="relative pt-20 lg:pt-40 px-6 lg:px-8">
    <h1 class="mb-5 text-3xl font-bold tracking-tight sm:text-center sm:text-6xl">
      <!-- One-time encrypted file transfer. -->
      Pretty secure file transfer.
    </h1>
    <p class="mt-6 mb-6 text-2xl leading-8 text-gray-700 sm:text-center">
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
