<script lang="ts">
  import MdCheck from 'svelte-icons/md/MdCheck.svelte'

  import FileUpload from '$components/FileUpload.svelte'
  import Page from '$components/Page.svelte'

  import type { PageServerData } from './$types'
  import { status } from '$lib/store'

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

<Page
  title={'Pretty secure file transfer.'}
  subtitle={'One-time, end-to-end encrypted file sharing for massive files.'}
>
  <div class="mx-auto max-w-xl">
    <FileUpload baseUrl={data.vercelUrl} />
  </div>
  {#if $status === 'initial'}
    <div class="flex justify-center ">
      <div>
        <ul class="pt-10 text-sm sm:text-base  text-gray-700 ">
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            Up to&nbsp;<strong>100GB</strong>&nbsp;files
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
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            FREE and open source
          </li>
        </ul>
        <div class="ml-8"><a href="/about" class="text-primary underline">...and more.</a></div>
      </div>
    </div>
  {/if}
</Page>
