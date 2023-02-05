<script lang="ts">
  import FaRegCheckCircle from 'svelte-icons/fa/FaRegCheckCircle.svelte'
  import GoFileBinary from 'svelte-icons/go/GoFileBinary.svelte'
  import prettyBytes from 'pretty-bytes'

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

  let fileMeta: FileMeta | undefined
  let fileReference: FileReference | undefined
  let status: 'initial' | 'preloading' | 'preview' | 'downloading' | 'done' | 'error' = 'initial'
  let masterKey = ''
  let referenceAlias = ''
  let progress = 0
  let error: string = ''

  onMount(() => {
    if (!('serviceWorker' in navigator)) {
      error = 'Your browser is not supported: Service worker not available.'
    }
  })

  const downloadFile = async (
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

    await sendMessageToSw({
      request: 'file_info',
      data: fileInfo
    })

    const a = document.createElement('a')
    a.href = fileInfo.url
    document.body.appendChild(a)
    a.click()
  }

  const sendMessageToSw = (msg: Record<string, unknown>) => {
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel()

      channel.port1.onmessage = (event) => {
        if (event.data === undefined) {
          reject('bad response from serviceWorker')
        } else if (event.data.error !== undefined) {
          reject(event.data.error)
        } else {
          resolve(event.data)
        }
      }

      navigator?.serviceWorker?.controller?.postMessage(msg, [channel.port2])
    })
  }

  onMount(async () => {
    status = 'preloading'
    const hashData = window.location.hash.substring(1).split('/')
    const alias = hashData[0]
    const iv = hashData[1]
    masterKey = hashData[2]
    referenceAlias = await encryptAndHash(alias, iv, masterKey)

    try {
      const { fileMeta: fileMetaData } = await api<Pick<Secret, 'fileMeta'>>(
        `/secrets/${referenceAlias}`
      )

      const decryptedSecretFileMeta = await decryptString(fileMetaData, masterKey)
      fileMeta = JSON.parse(decryptedSecretFileMeta)
    } catch (e) {
      if (e instanceof Error) {
        error = e?.message
      }
    }
    status = 'preview'
  })

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
        await downloadFile(referenceAlias, fileMeta, fileReference, masterKey)

        // Poll for download progress every second
        const progressInterval = setInterval(async () => {
          progress = (await sendMessageToSw({
            request: 'progress',
            data: { alias: referenceAlias }
          })) as number

          if (progress >= 1) {
            // Sometimes progress is above 1 for some reason
            progress = 1
            setTimeout(() => {
              status = 'done'
              clearInterval(progressInterval)
            }, 100)
          }
        }, 1000)
      }
    } catch (e) {
      if (e instanceof Error) {
        error = e.message
      }
    }

    // history.replaceState(null, 'Secret destroyed', 'l/🔥')
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

              <div class="flex">
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
