<script lang="ts">
  import MdFileUpload from 'svelte-icons/md/MdFileUpload.svelte'
  import gif from '$lib/images/snoop.webp'

  import { PUBLIC_ENV } from '$env/static/public'
  import Error from '$components/Error.svelte'
  import { getMaxFileSize, GB } from '$lib/constants'

  const MAX_FILE_SIZE = getMaxFileSize(PUBLIC_ENV)

  type OnDrop = (files: File[]) => void
  export let onDrop: OnDrop
  type OnEnter = () => void
  export let onEnter: OnEnter | null = null
  type OnLeave = () => void
  export let onLeave: OnLeave | null = null

  export let error = ''
  export let multiple = false
  export let disabled = false
  export let accept: string = '' // image/*, .gif etc.

  let isOver = false

  const validateFiles = (files: File[]) => {
    if (!multiple) {
      if (files.length > 1) {
        handleError(
          'Sorry, multiple files are not supported. If you need to send more than one file, create a package first.'
        )
        return false
      }
    }

    // Only checking first file for now
    if (files[0].size > MAX_FILE_SIZE) {
      handleError(`File too big. Maximum file size is ${MAX_FILE_SIZE / GB} GB.`)
      return false
    }
    return true
  }

  const handleEnter = () => {
    isOver = true
    if (onEnter) {
      onEnter()
    }
  }
  const handleLeave = () => {
    isOver = false
    if (onLeave) {
      onLeave()
    }
  }

  const handleError = (e: string) => {
    error = e
    isOver = false
    return
  }
  const handleDrop = (e: DragEvent) => {
    error = ''
    e.preventDefault()
    if (disabled) {
      return
    }

    if (!e?.dataTransfer?.items) {
      return
    }
    const files = Array.from(e.dataTransfer.files)

    if (validateFiles(files)) {
      onDrop(files)
      isOver = false
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (!isOver) {
      isOver = true
    }
  }

  const handleChange = (e: Event) => {
    e.preventDefault()
    const fileList: FileList = <FileList>(<HTMLInputElement>e.target).files
    const files = Array.from(fileList)

    if (validateFiles(files)) {
      onDrop(files)
    }
  }
</script>

<svelte:body
  on:dragenter={handleEnter}
  on:dragover={handleDragOver}
  on:drop={handleDrop}
  on:dragleave={handleLeave}
/>

<div
  class="relative border-2 bg-primary text-white dz:bg-white/70 dz:text-primary dz:border-dashed rounded-2xl dz:rounded-lg border-primary focus-within:outline-none focus-within:shadow-lg shadow-lg shadow-primary/30 dz:shadow-none dz:hover:shadow-lg hover:shadow-black-200/50  hover:border-solid focus-within:border-solid transition"
>
  <div class="p-2 sm:p-4 flex flex-col items-center justify-center">
    <div class="flex w-9 h-9 mb-2">
      <MdFileUpload />
    </div>
    <!-- We show a simple button on smaller screens, and a drag/drop area on larger screens. -->
    <span class="hidden dz:inline text-center">Drop file here, or click to select a file</span>
    <span class="dz:hidden text-center text-lg">Select a file</span>
  </div>

  <div
    id="overlay"
    class="fixed top-0 left-0 w-full h-full pointer-events-none rounded-lg flex items-end justify-center bg-black opacity-0"
    style={isOver ? 'opacity: 1;' : ''}
  >
    <img class="absolute object-cover w-full h-full" alt="Snoop Dogg" src={gif} />
    <div
      class="w-full text-white text-center absolute text-6xl md:text-8xl p-12 pb-16 uppercase font-bold bg-gradient-to-b from-transparent to-black"
    >
      Drop it like it's hot
    </div>
  </div>
  <label class="sr-only" for="dropzone">Choose a file to encrypt and share</label>
  <input
    id="dropzone"
    class="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer"
    type="file"
    {multiple}
    {accept}
    {disabled}
    on:change={handleChange}
  />
</div>
{#if error}
  <Error message={error} />
{/if}
