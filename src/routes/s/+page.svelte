<script lang="ts">
  import type { Secret } from '@prisma/client'

  import type { SecretFile } from '$lib/file-transfer'
  import { encryptAndHash, decryptString } from '$lib/crypto'
  import { api } from '$lib/api'

  import Page from '$components/Page.svelte'
  import Button from '$components/Button.svelte'
  import Spinner from '$components/Spinner.svelte'
  import Alert from '$components/Alert.svelte'
  import ProgressBar from '$components/ProgressBar.svelte'

  let fileMeta: SecretFile | undefined
  let status: 'initial' | 'downloading' | 'done' | 'error' = 'initial'
  let referenceAlias = ''
  let progress = 0

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
    status = 'downloading'
    const hashData = window.location.hash.substring(1).split('/')
    const alias = hashData[0]
    const masterKey = hashData[1]

    referenceAlias = await encryptAndHash(alias, masterKey)

    const { content } = await api<Pick<Secret, 'content'>>(`/secrets/${referenceAlias}`)

    const decryptedSecretFileMeta = await decryptString(content, masterKey)
    fileMeta = JSON.parse(decryptedSecretFileMeta)

    if (fileMeta) {
      await downloadFile({ ...fileMeta, alias: referenceAlias }, masterKey)

      // Check download progress every second
      const progressInterval = setInterval(async () => {
        progress = (await sendMessageToSw({
          request: 'progress',
          data: { alias: referenceAlias }
        })) as number

        if (progress === 1) {
          status = 'done'
          clearInterval(progressInterval)
        }
      }, 1000)
    }

    // history.replaceState(null, 'Secret destroyed', 'l/🔥')
  }
</script>

<svelte:head>
  <title>Sharrr. Share end-to-end encrypted files.</title>
</svelte:head>

<Page title={'You received a file'} subtitle={`The most secure way to transfer data over the web.`}>
  <div class="mt-8 flex justify-center">
    <div class="flex flex-col items-center justify-center">
      {#if status === 'downloading'}
        <Spinner />
        <p class="text-gray-700 mt-4 mb-4">This might take a while…</p>
        <ProgressBar progress={progress * 100} fileName={fileMeta?.name} />
      {:else if status === 'done'}
        <p class="text-green-700">Done!</p>
      {:else}
        <Alert class="mt-4 mb-4">
          Important! We have absolutely no knowledge about the contents of the file. Be sure to
          trust the sender!
        </Alert>
        <Button primary on:click={fetchSecretFile}>Download and Decrypt</Button>
      {/if}
    </div>
  </div>
</Page>
