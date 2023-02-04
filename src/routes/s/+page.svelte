<script lang="ts">
  import FaRegCheckCircle from 'svelte-icons/fa/FaRegCheckCircle.svelte'

  import type { SecretFile } from '$lib/file-transfer'
  import { encryptAndHash, decryptString } from '$lib/crypto'
  import { api } from '$lib/api'
  import type { Secret } from '@prisma/client'

  import Page from '$components/Page.svelte'
  import Button from '$components/Button.svelte'

  import Alert from '$components/Alert.svelte'
  import ProgressBar from '$components/ProgressBar.svelte'
  import { onMount } from 'svelte'

  let fileMeta: SecretFile | undefined
  let status: 'initial' | 'downloading' | 'done' | 'error' = 'initial'
  let referenceAlias = ''
  let progress = 0
  let error: string = ''

  onMount(() => {
    if (!('serviceWorker' in navigator)) {
      error = 'Your browser is not supported: Service worker not available.'
    }
  })

  const downloadFile = async (secretFile: SecretFile, decryptionKey: string) => {
    const fileInfo = {
      ...secretFile,
      decryptionKey,
      url: `/api/v1/service-worker-file-download/${secretFile.alias}`
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

  const fetchSecretFile = async () => {
    const hashData = window.location.hash.substring(1).split('/')
    const alias = hashData[0]
    const masterKey = hashData[1]

    referenceAlias = await encryptAndHash(alias, masterKey)
    let fileMeta
    try {
      const { content } = await api<Pick<Secret, 'content'>>(`/secrets/${referenceAlias}`)

      const decryptedSecretFileMeta = await decryptString(content, masterKey)
      fileMeta = JSON.parse(decryptedSecretFileMeta)

      status = 'downloading'

      if (fileMeta) {
        await downloadFile({ ...fileMeta, alias: referenceAlias }, masterKey)

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

<Page title={'You received a file'} subtitle={`The most secure way to transfer data over the web.`}>
  <div class="mt-8">
    <div class="container mx-auto max-w-md">
      {#if status === 'downloading' || status === 'done'}
        <ProgressBar
          label={status === 'done' ? 'Done' : 'Downloading'}
          progress={progress * 100}
          fileName={fileMeta?.name}
        />
        {#if status === 'done'}
          <div class="py-4 flex flex-col items-center justify-center">
            <div class="flex mb-4 w-10 h-10 text-success">
              <FaRegCheckCircle />
            </div>
            <Button href="/" size="small" class="">Share another file</Button>
          </div>
        {/if}
      {:else}
        <div class="flex flex-col items-center justify-center">
          {#if error}
            <Alert data-testid="download-error" class="mt-4 mb-4" variant={'error'}>
              {error}
            </Alert>
          {:else}
            <Alert class="mt-4 mb-4">
              <strong>Important:</strong> The file can only be downloaded once. And, be sure to trust
              the sender!
            </Alert>
          {/if}

          <Button
            data-testid="download-button"
            disabled={!!error}
            variant={'primary'}
            on:click={fetchSecretFile}>Download and Decrypt</Button
          >
        </div>
      {/if}
    </div>
  </div>
</Page>
