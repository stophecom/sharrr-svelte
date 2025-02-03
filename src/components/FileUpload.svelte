<script lang="ts">
  import { PUBLIC_S3_BUCKET } from '$env/static/public'
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
    encryptAndHash,
    createIvAsString
  } from '$lib/crypto'

  import Countdown from '$components/Countdown.svelte'
  import Dropzone from '$components/DropZone.svelte'
  import Button from '$components/Button.svelte'
  import ProgressBar from '$components/ProgressBar.svelte'
  import Error from '$components/Error.svelte'
  import { status } from '$lib/store'
  import type { Status } from '$lib/store'
  import type { SecretsResponse } from '$api/secrets/+server'
  import Spinner from './Spinner.svelte'
  import CopyButton from './CopyButton.svelte'

  export let baseUrl: string

  let selectedFile: File | null
  let link: string
  let progress = 0
  let promiseSaveFile: Promise<string>

  const chunkSize = getChunkSize(PUBLIC_ENV)

  function setStatus(newStatus: Status) {
    status.update(() => newStatus)
  }

  async function postSecret(file: File) {
    const bucket = PUBLIC_S3_BUCKET

    const alias = crypto.randomUUID()
    const masterKey = await generateMasterKey()
    const keyPair = await generateKeyPair()
    const privateKey = keyPair.privateKey

    const iv = createIvAsString()
    const aliasEncryptedAndHashed = await encryptAndHash(alias, iv, masterKey)
    const publicKeyRaw = await exportPublicKey(keyPair.publicKey)

    // We encode each generated secret to make sure it doesn't contain '/' which we use to separate the parts.
    const encodedHashParts = [alias, iv, masterKey].map((element) => encodeURIComponent(element))
    link = `${baseUrl}/s#${encodedHashParts.join('/')}`

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

    const fileMeta = await encryptString(
      JSON.stringify({ name, size, mimeType: type, isSingleChunk: chunks.length === 1 }),
      masterKey
    )
    const fileReference = await encryptString(JSON.stringify({ bucket, chunks }), masterKey)

    return api<SecretsResponse>(
      '/secrets',
      {
        method: 'POST'
      },
      {
        alias: aliasEncryptedAndHashed,
        publicKey: publicKeyRaw,
        fileReference,
        fileMeta,
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
    {#await promiseSaveFile}
      <div class="py-1 flex justify-center">
        <Spinner />
      </div>
    {:then message}
      <p class="text-sm py-1 text-success">{message}</p>

      <div class="my-4 flex items-center p-4 bg-white/70 border-2 border-primary rounded-lg">
        <div class="grid flex-col">
          <div class="text-sm font-semibold">Sharable link:</div>
          <div data-testid="download-link" class="truncate mb-1 mr-4">
            {link}
          </div>
          <Countdown />
        </div>
        <CopyButton class={'shrink-0'} text={link} />
      </div>

      <div class="flex">
        <Button size="small" class="" on:click={reset}>Share another file</Button>
      </div>
    {:catch error}
      <Error>{error?.message}</Error>
    {/await}
  {:else}
    <Dropzone {onDrop} />
  {/if}
</div>
