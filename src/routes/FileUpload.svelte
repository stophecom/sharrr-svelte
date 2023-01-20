<script lang="ts">
  import Dropzone from 'svelte-file-dropzone'
  import MdFileUpload from 'svelte-icons/md/MdFileUpload.svelte'

  import { PUBLIC_FLOW_S3_BUCKET } from '$env/static/public'
  import { encryptFileMetaData } from '$lib/file'
  import { generateEncryptionKeyString, encryptFile } from '$lib/crypto'

  let files = {
    accepted: [],
    rejected: []
  }

  let result: string
  let link: string

  async function postSecret(file: File) {
    const alias = crypto.randomUUID()
    const fileName = crypto.randomUUID()
    const encryptionKey = await generateEncryptionKeyString()

    link = `localhost:3000/s#${alias}/${encryptionKey}`

    const content = await encryptFileMetaData(file, { someRefKey: 'foo' }, encryptionKey)

    const res = await fetch('/api/v1/secrets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        alias,
        content
      })
    })

    result = await res.json()

    const encryptedFile = await encryptFile(file, encryptionKey)

    // Get presigned S3 post url
    const { url, fields } = await fetch(`/api/v1/files?file=${fileName}`).then((res) => res.json())
    console.log('s3 data', { url, fields })

    // Prepare form data
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value !== 'string') {
        return
      }
      formData.append(key, value)
    })
    formData.append('Content-type', 'application/octet-stream') // Setting content type a binary file.
    formData.append('file', encryptedFile)

    // @todo
    // Post file to S3
    // Unclear why we have to append bucket here.
    await fetch(`${url}/${PUBLIC_FLOW_S3_BUCKET}`, {
      method: 'POST',
      body: formData
    }).catch((err) => {
      throw Error(`File upload failed. Make sure the file is within the size limit.`, err)
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
  <pre>
		{link}
	</pre>

  {result?.message}
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
