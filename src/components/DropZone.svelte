<script lang="ts">
  import MdFileUpload from 'svelte-icons/md/MdFileUpload.svelte'

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
  }

  const handleChange = (e: Event) => {
    let files: FileList = <FileList>(<HTMLInputElement>e.target).files
    e.preventDefault()
    onDrop(Array.from(files))
  }
</script>

<div
  class="relative border-2 text-pink-500 bg-white border-dashed rounded-lg border-pink-500 hover:border-pink-600 focus-within:border-blue-500 focus-within:shadow-lg hover:shadow-lg hover:shadow-indigo-200/50 transition"
  on:drop={handleDrop}
  on:dragover={handleDragOver}
  on:dragenter={handleEnter}
  on:dragleave={handleLeave}
>
  <slot>
    <div class="p-4 flex flex-col items-center justify-center">
      <div class="flex w-9 h-9 mb-2">
        <MdFileUpload />
      </div>
      <span class="text-center">Drag and drop file here, or click to select a file</span>
    </div>
  </slot>

  <div
    id="overlay"
    class="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg flex items-center justify-center bg-white opacity-0"
    style={isOver ? 'opacity: 1;' : ''}
  >
    <slot name="overlay">Drop here</slot>
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
