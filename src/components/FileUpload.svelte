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

  type SecretsResponse = {
    message: string
  }

  export let baseUrl: string

  let selectedFile: File
  let link: string
  let progress: number = 0
  let promiseSaveFile: Promise<string>

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
        console.log(`% Done = ${p.toFixed(2)}`)
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

    console.log(aliasEncryptedAndHashed)

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
    )
      .then((data) => {
        progress = 100
        return data.message
      })
      .catch((e) => {
        throw new Error('Something went wrong.')
      })
  }

  const onDrop = (files: File[]) => {
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
        <div class="truncate">
          {link}
        </div>
        <Button primary on:click={copyLink}>COPY</Button>
      {/if}
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {:else}
    <Dropzone {onDrop} />
  {/if}
</div>
