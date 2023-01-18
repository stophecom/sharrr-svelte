<script lang="ts">
	import Dropzone from 'svelte-file-dropzone';
	import MdFileUpload from 'svelte-icons/md/MdFileUpload.svelte';

	let files = {
		accepted: [],
		rejected: []
	};

	function handleFilesSelect(e) {
		const { acceptedFiles, fileRejections } = e.detail;
		files.accepted = [...files.accepted, ...acceptedFiles];
		files.rejected = [...files.rejected, ...fileRejections];
	}
</script>

<div class="pt-8">
	<Dropzone
		on:drop={handleFilesSelect}
		containerClasses="dropzone-custom cursor-pointer"
		multiple={false}
	>
		<div class="flex w-9 h-9 mb-2">
			<MdFileUpload />
		</div>
		<span class="text-center">Drag and drop file here, or click to select a file</span></Dropzone
	>
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
