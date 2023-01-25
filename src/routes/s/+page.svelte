<script lang="ts">
  import type { SecretFile } from '$lib/file'
  import { decryptString } from '$lib/crypto'

  import Page from '$components/Page.svelte'

  let fileMeta: SecretFile | undefined

  const downloadFile = async (secretFile: SecretFile, decryptionKey: string) => {
    const fileInfo = {
      ...secretFile,
      decryptionKey,
      url: `/api/v1/service-worker-file-download/${secretFile.uuid}`
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

  async function fetchSecretFile() {
    const hashData = window.location.hash.substring(1).split('/')
    const alias = hashData[0]
    const decryptionKey = hashData[1]

    const { content } = await fetch(`/api/v1/secrets/${alias}`).then((response) => response.json())

    const decryptedSecretFileMeta = await decryptString(content, decryptionKey)
    fileMeta = JSON.parse(decryptedSecretFileMeta)

    if (fileMeta) {
      await downloadFile(fileMeta, decryptionKey)
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
      <button
        class="mb-3 px-4 py-1 text-sm text-white font-semibold rounded-md border border-pink-500 bg-pink-500 hover:text-white hover:bg-pink-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2"
        type="button"
        on:click={fetchSecretFile}>Download and Decrypt</button
      >

      <p>{fileMeta?.name}</p>
      {fileMeta?.size}

      {fileMeta?.numberOfChunks}
    </div>
  </div>
</Page>
