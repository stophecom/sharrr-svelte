<script>
	import MdCheck from 'svelte-icons/md/MdCheck.svelte';

	import FileUpload from './FileUpload.svelte';
</script>

<svelte:head>
	<title>Sharrr. Share end-to-end encrypted files.</title>
	<meta
		name="description"
		content="Pirates don't share, pirates sharrr. Share end-to-end encrypted files."
	/>
	<meta
		name="keywords"
		content="pirates, share file, end-to-end encrypted file sharing, pirates sharrr, arrr"
	/>
</svelte:head>

<section class="container mx-auto">
	<div class="relative pt-40 px-6 lg:px-8">
		<h1 class="mb-5 text-2xl font-bold tracking-tight sm:text-center sm:text-6xl">
			One-time encrypted file transfer.
		</h1>
		<p class="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
			The most secure way to transfer data over the web.
		</p>

		<div class="mx-auto max-w-xl">
			<FileUpload />
		</div>

		<div class="flex  justify-center ">
			<ul class="pt-8  text-gray-700 ">
				<li class="flex items-center">
					<div class="w-6 h-6 mr-2"><MdCheck /></div>
					Up to 1TB files
				</li>
				<li class="flex items-center">
					<div class="w-6 h-6 mr-2"><MdCheck /></div>
					End-to-end encrypted (AES)
				</li>
				<li class="flex items-center">
					<div class="w-6 h-6 mr-2"><MdCheck /></div>
					Stored in Switzerland 🇨🇭
				</li>
				<li class="flex items-center">
					<div class="w-6 h-6 mr-2"><MdCheck /></div>
					Link expires after download
				</li>
			</ul>
		</div>
	</div>
</section>
