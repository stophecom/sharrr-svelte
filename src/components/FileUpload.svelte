<script lang="ts">
  import { PUBLIC_FLOW_S3_BUCKET } from '$env/static/public'
  import { PUBLIC_ENV } from '$env/static/public'
  import { onDestroy } from 'svelte'

  import { getChunkSize } from '$lib/constants'
  import { api } from '$lib/api'
  import { handleFileEncryptionAndUpload } from '$lib/file-transfer'
  import {
    encryptString,
    generateMasterKey,
    generateKeyPair,
    exportPublicKey,
    encryptAndHash
  } from '$lib/crypto'

  import Dropzone from '$components/DropZone.svelte'
  import Button from '$components/Button.svelte'
  import ProgressBar from '$components/ProgressBar.svelte'
  import Error from '$components/Error.svelte'
  import { status } from '$lib/store'
  import type { Status } from '$lib/store'
  import type { SecretsResponse } from '$api/secrets/+server'

  export let baseUrl: string

  let selectedFile: File | null
  let link: string
  let progress: number = 0
  let promiseSaveFile: Promise<string>

  const chunkSize = getChunkSize(PUBLIC_ENV)

  function setStatus(newStatus: Status) {
    status.update(() => newStatus)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(link).then(
      function () {
        console.log('Async: Copying to clipboard was successful!')
      },
      function (err) {
        console.error('Async: Could not copy text: ', err)
      }
    )
  }

  async function postSecret(file: File) {
    const bucket = PUBLIC_FLOW_S3_BUCKET

    const alias = crypto.randomUUID()
    const masterKey = await generateMasterKey()
    const keyPair = await generateKeyPair()
    const privateKey = keyPair.privateKey

    const aliasEncryptedAndHashed = await encryptAndHash(alias, masterKey)
    const publicKeyRaw = await exportPublicKey(keyPair.publicKey)

    link = `${baseUrl}/s#${alias}/${masterKey}`

    const chunks = await handleFileEncryptionAndUpload({
      file,
      bucket,
      masterKey,
      privateKey,
      chunkSize,
      progressCallback: (p) => {
        progress = p
      }
    })

    const { name, size, type } = file
    const fileReference = {
      name,
      size,
      mimeType: type,
      bucket,
      chunks
    }

    const content = await encryptString(JSON.stringify(fileReference), masterKey)

    return api<SecretsResponse>(
      '/secrets',
      {
        method: 'POST'
      },
      {
        alias: aliasEncryptedAndHashed,
        publicKey: publicKeyRaw,
        content,
        fileSize: size
      }
    ).then((data) => {
      progress = 100
      setStatus('done')

      return data.message
    })
  }

  const onDrop = (files: File[]) => {
    setStatus('uploading')

    selectedFile = files[0]
    promiseSaveFile = postSecret(selectedFile)
  }

  const reset = () => {
    setStatus('initial')
    selectedFile = null
  }

  onDestroy(async () => {
    reset()
  })
</script>

<div>
  {#if selectedFile}
    <ProgressBar {progress} fileName={selectedFile.name} />
    {#await promiseSaveFile then message}
      {#if message}
        <p class="text-sm py-1 text-success">{message}</p>

        <div class="my-4 flex items-center p-4 bg-white/70 border-2 border-primary rounded-lg">
          <div class="grid flex-col">
            <div class="text-sm font-semibold">Sharable link:</div>
            <div data-testid="download-link" class="truncate mr-4">
              {link}
            </div>
          </div>
          <Button
            data-testid="copy-link"
            class="shrink-0 uppercase"
            variant="primary"
            on:click={copyLink}>Copy</Button
          >
        </div>

        <div class="flex">
          <Button size="small" class="" on:click={reset}>Share another file</Button>
        </div>
      {/if}
    {:catch error}
      <Error>{error?.message}</Error>
    {/await}
  {:else}
    <Dropzone {onDrop} />
  {/if}
</div>
