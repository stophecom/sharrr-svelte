<script lang="ts">
  import Dropzone from 'svelte-file-dropzone'
  import MdFileUpload from 'svelte-icons/md/MdFileUpload.svelte'

  import { PUBLIC_FLOW_S3_BUCKET } from '$env/static/public'
  import { api } from '$lib/api'
  import { encryptFileReference, handleFileEncryptionAndUpload } from '$lib/file'
  import { generateEncryptionKeyString } from '$lib/crypto'

  import Button from '$components/Button.svelte'

  type SecretsResponse = {
    message: string
  }

  let files = {
    accepted: [],
    rejected: []
  }

  export let baseUrl: string

  let result: string
  let link: string
  let progress: number = 0

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

    const { uuid, numberOfChunks, chunkFileNames } = await handleFileEncryptionAndUpload({
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
      { uuid, bucket, numberOfChunks, chunkFileNames },
      encryptionKey
    )

    api<SecretsResponse>('/secrets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alias,
        content
      })
    }).then((data) => {
      result = data.message
      progress = 100
    })
  }

  function handleFilesSelect(e) {
    const { acceptedFiles, fileRejections } = e.detail
    files.accepted = [...files.accepted, ...acceptedFiles]
    files.rejected = [...files.rejected, ...fileRejections]

    if (files.accepted.length) {
      postSecret(files.accepted[0])
    }
  }
</script>

<div class="pt-8">
  Upload process {progress.toFixed(2)} %

  <progress value={progress * 0.01} />

  <pre>
		{link}
	</pre>
  <Button primary on:click={copyLink}>COPY</Button>

  {result}
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
  <ol class="flex flex-col">
    {#each files.accepted as item}
      <li>{item.name}</li>
    {/each}
  </ol>
</div>

<style lang="postcss">
  :global(.dropzone-custom) {
    color: theme(colors.pink.500) !important;
    border-color: theme(colors.pink.500) !important;
  }
</style>
