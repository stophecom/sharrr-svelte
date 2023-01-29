<script lang="ts">
  import type { SecretFile } from '$lib/file'
  import { encryptAndHash, decryptString } from '$lib/crypto'

  import Page from '$components/Page.svelte'
  import Button from '$components/Button.svelte'

  let fileMeta: SecretFile | undefined

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

  async function fetchSecretFile() {
    const hashData = window.location.hash.substring(1).split('/')
    const alias = hashData[0]
    const masterKey = hashData[1]

    const referenceAlias = await encryptAndHash(alias, masterKey)

    const { content } = await fetch(`/api/v1/secrets/${referenceAlias}`).then((response) =>
      response.json()
    )

    const decryptedSecretFileMeta = await decryptString(content, masterKey)
    fileMeta = JSON.parse(decryptedSecretFileMeta)

    if (fileMeta) {
      await downloadFile({ ...fileMeta, alias: referenceAlias }, masterKey)
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
      <Button primary on:click={fetchSecretFile}>Download and Decrypt</Button>
      <p>{JSON.stringify(fileMeta)}</p>
    </div>
  </div></Page
>
