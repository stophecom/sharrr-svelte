## Intro

This project is **proof-of-concept** on how to transfer large files over the internet in the most secure way possible, using **zero-knowledge encryption**.

All code is [open source on Github](https://github.com/stophecom/sharrr-svelte).

#### Disclaimer

I am not a security engineer or cryptographer and this project is solely based on self-taught expertise. Use with caution. That said, feedback on security aspects or potential vulnerabilities is much appreciated.

Find me on [Twitter](https://twitter.com/stophecom), [Mastodon](https://mastodon.social/@stophecom). I have a [website](https://www.stophe.com/) and [blog](https://blog.stophe.com/).

## Security concept

The main idea is that, after the file has been encrypted and uploaded, only the recipient of the download link is ever able to download and access the decrypted data (Build the file). Even if all other systems (API, DB, S3) would be compromised, it shouldn't be possible to decompile or reverse-engineer the original file. Apart from the end-to-end encryption, the file shall only be downloaded once (within a defined period of time) - after that all traces shall be erased.

### Challenges

A big challenge when it comes to big files is memory (RAM) limitations. If you wanted to encrypt/decrypt a file at once, you needed **double the file size** reserved in memory. For a 4 GB file, you needed at least 8 GB memory - which is simply not available for many devices.

Another challenge is storing huge files in general. Most storages have 5GB limitations.

### Solution

The solution is to break down the files into chunks, and encrypt/decrypt them separately. Each chunk is saved separately to not only circumvent storage limitations, but also to increase security. (Form a storage perspective each chunk is just a bunch of binary data - it is not obvious which chunks make up a specific file.) The same goes for the database. It only contains encrypted data.

The following schema shows the simplified version of the security concept:

![Concept](/images/about/about-overview.jpg)

It is worth noting here that the alias and master key **never leave the client**. Both strings will be added to the fragment identifier of the download link. This commonly referred to as the **#hash** or **anchor** part of the URL is never sent to the server. (When you access this link in your browser, this part will not be sent to the server as part of the request.)

#### Upload (Encryption)

Encrypting the file is straight forward: Split files into chunks, encrypt each chunk and store a reference to each chunk together with a signature and an public key into the database.

![Encryption](/images/about/about-encryption.jpg)

#### Download (Decryption)

The download is the tricky part. Not only do we need to make sure the client is allowed to request a certain file (solved with a cryptographic signature, see blue box), but also it is not possible to stream files directly into the download folder. We therefore need a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) in between. If you want to learn more about how this works, I recommend [this video](https://www.youtube.com/watch?v=SdePc87Ffik) or this [blog post](https://proton.me/blog/proton-drive-web-encryption-technique) by the Proton Drive team.

![Decryption](/images/about/about-decryption.jpg)

## Cryptography

For encryption/decryption only built-in browser APIs are used, namely the **Web Crypto API**. As a side effect, this program won't run in legacy browsers or with older node versions.

The security relies on two algorithms:

- [**AES-GCM** (Advanced Encryption Standard - Galois/Counter Mode)](https://en.wikipedia.org/wiki/Galois/Counter_Mode) for symmetric encryption: This is used for the master key that encrypts/decrypts all file chunks and the data stored in the database.
- [**ECDSA** (Elliptic Curve Digital Signature Algorithm)](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm) for asymmetric encryption: This is used to sign the file chunk keys in order make sure the later download request is allowed to access this specific chunk file.

## Tech stack

- SvelteKit
- Tailwind (CSS)
- PlanetScale (MySQL)
- Prisma (ORM)

### Infrastructure

- Website on [Vercel](https://vercel.com/)
- DB on [PlanetScale](https://planetscale.com/)
- S3 Object Storage with [flow.swiss](https://flow.swiss)

## Resources/Inspiration

This project is heavily inspired by a great online community and amazing open source projects:

- [hat.sh](https://hat.sh/) - A client-side file encryption project
- [Proton Drive security model explained](https://proton.me/blog/protondrive-security) (Blog)
- [Firefox Send](https://github.com/mozilla/send) (Archived Repo)
- [Thomas Konrad on end-to-end encryption](https://www.youtube.com/watch?v=SdePc87Ffik) (Video)
- [MDN Docs about Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
