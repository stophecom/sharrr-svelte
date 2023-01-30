## Intro

This project is proof-of-concept on how to transmit large files over the internet in the most secure way possible, using **zero-knowledge encryption**.

All code is [open source on Github](https://github.com/stophecom/sharrr-svelte).  
Follow me on [Twitter](https://twitter.com/stophecom), [Mastodon](https://mastodon.social/@stophecom) or checkout my [website](https://www.stophe.com/) or [blog](https://blog.stophe.com/).

## Security

Main idea is that only the client is ever able to access the decrypted data (Build the file). Even if all other systems (API, DB, S3) would be compromised, it shouldn't be possible to access or reverse-engineer the original file. Apart from the end-to-end encryption, the file shall only be downloaded once (within a defined period of time) - after that all traces shall be erased.

### Challenges

A big challenge when it comes to big files is memory (RAM) limitations. If you wanted to encrypt/decrypt a file at once, you needed **double the file size** reserved in memory. For a 4 GB file, you needed at least 8 GB memory - which is simply not available for many devices.

Another challenge is storing huge files in general. Most storages have 5GB limitations.

### Solution

The solution is to break down the files into chunks, and encrypt/decrypt them separately. Each chunk is saved separately to not only circumvent storage limitations, but also to increase security. (Form a storage perspective each chunk is just a bunch of binary - it is not obvious which chunks make up a specific file.)

#### Overview

The following diagram shows a simplified version of the solution:

![Concept](/images/about/upload-schema.jpg)

### Upload in detail

// more

## Tech stack

- SvelteKit
- Tailwind (CSS)
- PlanetScale (MySQL DB)
- Prisma (ORM)
- Web Crypto API
- S3 Object Storage

## Resources/Inspiration

This project is heavily inspired by a great online community and open source projects, namely:

- [hat.sh](https://hat.sh/) - A client-side file encryption project
- [Proton Drive security model](https://proton.me/blog/protondrive-security) explained
- [Firefox Send](https://github.com/mozilla/send) (Archived)
- [Talk from Thomas Konrad](https://www.youtube.com/watch?v=SdePc87Ffik) about end-to-end encryption
- [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) about Web Crypto
