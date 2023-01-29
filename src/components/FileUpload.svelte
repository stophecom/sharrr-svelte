<script lang="ts">
  import { PUBLIC_FLOW_S3_BUCKET } from '$env/static/public'
  import { api } from '$lib/api'
  import { handleFileEncryptionAndUpload } from '$lib/file'
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

  type SecretsResponse = {
    message: string
  }

  export let baseUrl: string

  let selectedFile: File
  let link: string
  let progress: number = 0
  let promiseSaveFile: Promise<string>

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
        content
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
</script>

<div>
  {#if selectedFile}
    <ProgressBar {progress} fileName={selectedFile.name} />
    {#await promiseSaveFile then message}
      {#if message}
        <p class="text-sm text-primary">{message}</p>
        <div class="mt-4 flex items-center p-4 bg-white/70 border-2 border-primary rounded-lg">
          <div class="grid flex-col">
            <div class="text-sm font-semibold">Sharable link:</div>
            <div class="truncate mr-4">
              {link}
            </div>
          </div>
          <Button class="shrink-0" primary on:click={copyLink}>COPY</Button>
        </div>
      {/if}
    {:catch error}
      <Error>{error?.message}</Error>
    {/await}
  {:else}
    <Dropzone {onDrop} />
  {/if}
</div>
