<script lang="ts">
  import type { SecretFile } from '$lib/file'
  import { decryptString } from '$lib/crypto'

  let secret: SecretFile | undefined
  async function fetchSecretFile() {
    const hashData = window.location.hash.substring(1).split('/')
    const alias = hashData[0]
    const decryptionKey = hashData[1]

    const { content } = await fetch(`/api/v1/secrets/${alias}`).then((response) => response.json())

    const decryptedSecretFile = await decryptString(content, decryptionKey)
    secret = JSON.parse(decryptedSecretFile)

    // history.replaceState(null, 'Secret destroyed', 'l/🔥')
  }
</script>

<svelte:head>
  <title>Sharrr. Share end-to-end encrypted files.</title>
</svelte:head>

<section class="container mx-auto">
  <div class="relative pt-40 px-6 lg:px-8">
    <h1 class="mb-5 text-2xl font-bold tracking-tight sm:text-center sm:text-6xl">
      You received a file
    </h1>
    <p class="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
      The most secure way to transfer data over the web.
    </p>

    <div class="mt-8 flex justify-center">
      <div class="flex flex-col items-center justify-center">
        <button
          class="mb-3 px-4 py-1 text-sm text-white font-semibold rounded-md border border-pink-500 bg-pink-500 hover:text-white hover:bg-pink-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2"
          type="button"
          on:click={fetchSecretFile}>Download and Decrypt</button
        >
        <pre>
		{secret?.name}
		{secret?.size}
		</pre>
      </div>
    </div>
  </div>
</section>
