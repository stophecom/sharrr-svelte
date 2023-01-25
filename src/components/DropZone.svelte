<script lang="ts">
  import MdFileUpload from 'svelte-icons/md/MdFileUpload.svelte'
  import gif from '$lib/images/snoop.webp'

  type OnDrop = (files: File[]) => void
  export let onDrop: OnDrop
  type OnEnter = () => void
  export let onEnter: OnEnter | null = null
  type OnLeave = () => void
  export let onLeave: OnLeave | null = null

  export let multiple = false
  export let disabled = false
  export let capture: 'user' | 'environment' | null = null
  export let accept: string = '' // image/*, .gif etc.

  let isOver = false

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
  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    if (disabled) {
      return
    }

    if (!e?.dataTransfer?.items) {
      return
    }
    const items = Array.from(e.dataTransfer.files)
    onDrop(items)
    isOver = false
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (!isOver) {
      isOver = true
    }
  }

  const handleChange = (e: Event) => {
    e.preventDefault()
    let files: FileList = <FileList>(<HTMLInputElement>e.target).files
    onDrop(Array.from(files))
  }
</script>

<svelte:body
  on:dragenter={handleEnter}
  on:dragover={handleDragOver}
  on:drop={handleDrop}
  on:dragleave={handleLeave}
/>
<div
  class="relative border-2 text-primary bg-white border-dashed rounded-lg border-primary  focus-within:border-blue-500 focus-within:shadow-lg hover:shadow-lg hover:shadow-black-200/50  hover:border-solid transition"
>
  <slot>
    <div class="p-4 flex flex-col items-center justify-center">
      <div class="flex w-9 h-9 mb-2">
        <MdFileUpload />
      </div>
      <span class="text-center">Drop file here, or click to select a file</span>
    </div>
  </slot>

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
  <input
    class="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer"
    type="file"
    {multiple}
    {accept}
    {disabled}
    on:change={handleChange}
  />
</div>
