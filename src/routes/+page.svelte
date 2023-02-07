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

  let usps = [
    { item: `Up to&nbsp;<strong>${prettyBytes(MAX_FILE_SIZE)}</strong>&nbsp;files` },
    { item: `Zero knowledge encryption` },
    { item: `One-time download` },
    { item: `<strong>Free</strong>&nbsp;and open source` },
    { item: `Stored in Switzerland 🇨🇭` }
  ]
</script>

<Page
  title={'Pretty secure file transfer.'}
  subtitle={'End-to-end encrypted. Ephemeral. Open source.'}
>
  <div class="mx-auto max-w-xl">
    <FileUpload baseUrl={data.baseUrl} />
  </div>
  {#if $status === 'initial'}
    <div class="flex justify-center ">
      <div>
        <ul class="pt-14 text-gray-700 ">
          {#each usps as usp, i}
            <li class="flex items-center">
              <div class="w-6 h-6 mr-2"><MdCheck /></div>
              {@html usp.item}
            </li>
          {/each}
        </ul>
        <div class="ml-8">
          <a href="/about" aria-label="Navigate to About page" class="text-primary underline"
            >Learn more</a
          >
        </div>
      </div>
    </div>
  {/if}
</Page>
