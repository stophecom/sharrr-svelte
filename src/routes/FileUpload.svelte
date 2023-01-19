<script lang="ts">
  import Dropzone from 'svelte-file-dropzone'
  import MdFileUpload from 'svelte-icons/md/MdFileUpload.svelte'

  import { encryptFileMetaData } from '$lib/file'
  import { generateEncryptionKeyString } from '$lib/crypto'

  let files = {
    accepted: [],
    rejected: []
  }

  let result: string
  let link: string

  async function postSecret(file: File) {
    const alias = crypto.randomUUID()
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
