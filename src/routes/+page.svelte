<script lang="ts">
  import MdCheck from 'svelte-icons/md/MdCheck.svelte'
  import prettyBytes from 'pretty-bytes'

  import { PUBLIC_ENV } from '$env/static/public'
  import { getMaxFileSize } from '$lib/constants'
  import FileUpload from '$components/FileUpload.svelte'
  import Page from '$components/Page.svelte'

  import type { PageServerData } from './$types'
  import { status } from '$lib/store'

  export let data: PageServerData

  const MAX_FILE_SIZE = getMaxFileSize(PUBLIC_ENV)
</script>

<Page
  title={'Pretty secure file transfer.'}
  subtitle={'Zero knowledge encryption. Without a trace.'}
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
            Up to&nbsp;<strong>{prettyBytes(MAX_FILE_SIZE)}</strong>&nbsp;files
          </li>
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            End-to-end encrypted
          </li>
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            One-time download
          </li>
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            <strong>Free</strong>&nbsp;and open source
          </li>
          <li class="flex items-center">
            <div class="w-6 h-6 mr-2"><MdCheck /></div>
            Stored in Switzerland 🇨🇭
          </li>
        </ul>
        <div class="ml-8">
          <a href="/about" class="text-primary underline">...learn more.</a>
        </div>
      </div>
    </div>
  {/if}
</Page>
