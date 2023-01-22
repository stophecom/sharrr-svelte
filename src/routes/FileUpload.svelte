<script lang="ts">
  import Dropzone from 'svelte-file-dropzone'
  import MdFileUpload from 'svelte-icons/md/MdFileUpload.svelte'

  import { PUBLIC_FLOW_S3_BUCKET } from '$env/static/public'
  import { api } from '$lib/api'
  import { encryptFileReference, handleFileEncryptionAndUpload } from '$lib/file'
  import { generateEncryptionKeyString } from '$lib/crypto'

  import Button from '$components/Button.svelte'
  import ProgressBar from '$components/ProgressBar.svelte'

  type SecretsResponse = {
    message: string
  }

  let acceptedFile: File

  export let baseUrl: string

  let result: string
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
    const encryptionKey = await generateEncryptionKeyString()

    link = `${baseUrl}/s#${alias}/${encryptionKey}`

    const fileName = crypto.randomUUID()

    const { uuid, numberOfChunks } = await handleFileEncryptionAndUpload({
      file,
      bucket,
      fileName,
      encryptionKey,
      progressCallback: (p) => {
        progress = p
        console.log(`% Done = ${p.toFixed(2)}`)
      }
    })

    const content = await encryptFileReference(
      file,
      { uuid, bucket, numberOfChunks },
      encryptionKey
    )

    return api<SecretsResponse>('/secrets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alias,
        content
      })
    })
      .then((data) => {
        progress = 100
        return data.message
      })
      .catch((e) => {
        throw new Error('Something went wrong.')
      })
  }

  function handleFilesSelect(e) {
    const { acceptedFiles, fileRejections } = e.detail

    if (acceptedFiles.length) {
      acceptedFile = acceptedFiles[0]
      promiseSaveFile = postSecret(acceptedFile)
    }
  }
</script>

<div class="pt-8">
  {#if acceptedFile}
    <ProgressBar {progress} fileName={acceptedFile.name} />
    {#await promiseSaveFile then message}
      {#if message}
        <p class="text-sm text-pink-500">{message}</p>
        <div class="truncate">
          {link}
        </div>
        <Button primary on:click={copyLink}>COPY</Button>
      {/if}
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {:else}
    <Dropzone
      on:drop={handleFilesSelect}
      containerClasses="dropzone-custom cursor-pointer"
      multiple={false}
    >
      <div class="flex w-9 h-9 mb-2">
        <MdFileUpload />
      </div>
      <span class="text-center">Drag and drop file here, or click to select a file</span>
    </Dropzone>
  {/if}
</div>

<style lang="postcss">
  :global(.dropzone-custom) {
    color: theme(colors.pink.500) !important;
    border-color: theme(colors.pink.500) !important;
  }
</style>
