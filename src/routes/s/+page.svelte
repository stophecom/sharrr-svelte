<script lang="ts">
  import FaRegCheckCircle from 'svelte-icons/fa/FaRegCheckCircle.svelte'
  import GoFileBinary from 'svelte-icons/go/GoFileBinary.svelte'
  import prettyBytes from 'pretty-bytes'

  import { handleFileChunksDownload } from '$lib/file-transfer'
  import type { FileMeta, FileReference } from '$lib/file-transfer'
  import { encryptAndHash, decryptString } from '$lib/crypto'
  import { api } from '$lib/api'
  import type { Secret } from '@prisma/client'

  import Page from '$components/Page.svelte'
  import Button from '$components/Button.svelte'

  import Alert from '$components/Alert.svelte'
  import Typewriter from '$components/Typewriter.svelte'
  import ProgressBar from '$components/ProgressBar.svelte'
  import { onMount } from 'svelte'
  import Spinner from '$components/Spinner.svelte'
  import { createDownloadLinkAndClick, sendMessageToServiceWorker } from '$lib/utils'

  let fileMeta: FileMeta | undefined
  let fileReference: FileReference | undefined
  let status: 'initial' | 'preloading' | 'preview' | 'downloading' | 'done' | 'error' = 'initial'
  let masterKey = ''
  let referenceAlias = ''
  let progress = 0
  let error: string = ''

  onMount(async () => {
    status = 'preloading'

    try {
      //Extract fragment (Everything after #)
      const fragment = window.location.hash.substring(1)
      if (fragment.includes('?')) {
        throw new Error(
          `Invalid URL: There are no query params (?=xyz) allowed after fragment (#).`
        )
      }

      //Extract relevant parts for decryption
      const hashData = fragment.split('/')
      const [alias, iv, key] = hashData.map((element) => decodeURIComponent(element))
      masterKey = key

      if (hashData.length > 3 || !alias || !iv || !masterKey) {
        throw new Error(`Invalid URL: Couldn't extract Alias, IV and/or Master Key.`)
      }

      referenceAlias = await encryptAndHash(alias, iv, masterKey)
      const { fileMeta: fileMetaData } = await api<Pick<Secret, 'fileMeta'>>(
        `/secrets/${referenceAlias}`
      )

      const decryptedSecretFileMeta = await decryptString(fileMetaData, masterKey)
      fileMeta = JSON.parse(decryptedSecretFileMeta)

      if (!('serviceWorker' in navigator) && fileMeta && !fileMeta.isSingleChunk) {
        throw Error(
          'Your browser is not supported: Service worker not available. Try a different device or browser.'
        )
      }
    } catch (e) {
      if (e instanceof Error) {
        error = e?.message
      }
    }
    status = 'preview'
  })

  const handleProgress = async (getProgress: () => Promise<number>) => {
    const progressInterval = setInterval(async () => {
      progress = await getProgress()

      if (progress >= 1) {
        // Sometimes progress is above 1 for some reason
        progress = 1
        status = 'done'
        clearInterval(progressInterval)
        return Promise.resolve('File saved!')
      }
    }, 500)
  }

  const downloadFileAsStream = async (
    referenceAlias: string,
    fileMeta: FileMeta,
    fileReference: FileReference,
    decryptionKey: string
  ) => {
    const fileInfo = {
      alias: referenceAlias,
      ...fileMeta,
      ...fileReference,
      decryptionKey,
      url: `/api/v1/service-worker-file-download/${referenceAlias}`
    }

    await sendMessageToServiceWorker({
      request: 'file_info',
      data: fileInfo
    })

    createDownloadLinkAndClick(fileInfo.url)
  }

  const fetchSecretFile = async () => {
    try {
      const { fileReference: fileReferenceData } = await api<Pick<Secret, 'fileReference'>>(
        `/secrets/${referenceAlias}?file=true`,
        { method: 'DELETE' }
      )

      const decryptedSecretFileMeta = await decryptString(fileReferenceData, masterKey)
      fileReference = JSON.parse(decryptedSecretFileMeta)

      status = 'downloading'

      if (fileMeta && fileReference) {
        // If only one chunk, we download immediately.
        if (fileMeta.isSingleChunk && fileReference.chunks.length === 1) {
          const file = {
            alias: referenceAlias,
            decryptionKey: masterKey,
            ...fileReference,
            ...fileMeta,
            progress: 0
          }
          const res = new Response(handleFileChunksDownload(file))

          await handleProgress(() => Promise.resolve(file.progress))
          const blob = await res.blob()
          const decryptedFile = new File([blob], fileMeta.name)
          const url = window.URL.createObjectURL(decryptedFile)
          createDownloadLinkAndClick(url, fileMeta.name)

          return Promise.resolve('File saved!')
        }

        await downloadFileAsStream(referenceAlias, fileMeta, fileReference, masterKey)

        await handleProgress(() =>
          sendMessageToServiceWorker<number>({
            request: 'progress',
            data: { alias: referenceAlias }
          })
        )
      }
    } catch (e) {
      if (e instanceof Error) {
        error = e.message
      }
    }
  }
</script>

<Page title={'You received a file'} subtitle={`The file can only be downloaded once!`}>
  <div class="mt-8">
    <div class="container mx-auto max-w-md">
      {#if error}
        <Alert data-testid="download-error" class="mt-4 mb-4" variant={'error'}>
          {error}
        </Alert>
      {:else if status === 'downloading' || status === 'done'}
        <ProgressBar
          label={status === 'done' ? 'Done' : 'Downloading'}
          progress={progress * 100}
          fileName={fileMeta?.name}
        />
        <div class="py-4 flex flex-col items-center justify-center">
          {#if status === 'done'}
            <div class="flex mb-2 w-10 h-10 text-success">
              <FaRegCheckCircle />
            </div>
            <div class="mb-4 text-success">Download complete.</div>
            <Button href="/" size="small" class="">Share another file</Button>
          {:else}
            <Spinner />
          {/if}
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center">
          {#if status === 'preloading'}
            <Spinner />
          {/if}
          {#if status === 'preview'}
            <Alert class="mt-4 mb-4 w-full">
              <div slot="icon" class="flex shrink-0 w-9 h-9 mr-3">
                <GoFileBinary class="fill-current" />
              </div>

              <div class="grid grid-flow-col">
                <strong class="mr-1">Name:</strong>
                <Typewriter message={fileMeta?.name} />
              </div>
              <div class="flex">
                <strong class="mr-1">Size:</strong>
                <div class="truncate">
                  {#if fileMeta?.size}
                    <Typewriter message={prettyBytes(fileMeta.size)} />
                  {/if}
                </div>
              </div>
              <div class="flex">
                <strong class="mr-1">Type:</strong>
                <Typewriter message={fileMeta?.mimeType} />
              </div>
            </Alert>

            <Button
              data-testid="download-button"
              disabled={!!error}
              variant={'primary'}
              on:click={fetchSecretFile}>Decrypt and Download</Button
            >
          {/if}
        </div>
      {/if}
    </div>
  </div>
</Page>
