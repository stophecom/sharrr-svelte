## Intro

This project is **proof-of-concept** on how to transfer large files over the internet in the most secure way possible, using **zero-knowledge encryption**.

All code is [open source on Github](https://github.com/stophecom/sharrr-svelte).

#### Disclaimer

I am not a security engineer or cryptographer. Use with caution. Feedback on security aspects or potential vulnerabilities is much appreciated.

Find me on [Twitter](https://twitter.com/stophecom), [Mastodon](https://mastodon.social/@stophecom). I have a [website](https://www.stophe.com/) and [blog](https://blog.stophe.com/).

## Features

- End-to-end encrypted file transfer
- Parallel upload
- Support for extra large files (_Technically_ there is no file size limit)
- One-time download link
- 7 day retention period (Download link expires and files are being deleted afterwards.)
- Files are stored in Switzerland

### Fair use

Play fair - this is a non-commercial project that is meant for personal use only.

### Tipp

Downloading large files seems to work best in Firefox.

## Technical details

The main idea is that, after the file has been encrypted and uploaded, only the recipient of the download link is ever able to download and access the decrypted data (Build the file). Even if all other systems beside the client's browser (Backend, Database, S3 Storage) would be compromised, it shouldn't be possible to decompile or reverse-engineer the original file. Apart from the end-to-end encryption, the file shall only be downloaded once (within a defined period of time).

### Challenges

File encryption requires internal memory: A big challenge when it comes to big files is memory (RAM) limitations. If you wanted to encrypt/decrypt a file at once, you needed **double the file size** reserved in memory. For huge files, this amount of memory is simply not available - especially on mobile phones. Another challenge is storing huge files in general. Most storage providers have a 5 GB limitation. And, finally, there are many challenges around security: **How to design an architecture that keeps your data secure, even in case all the infrastructure gets compromised?**

### Implementation

The solution is to break down the files into chunks, and encrypt/decrypt them separately. Each chunk is saved individually to not only circumvent storage limitations, but also to increase security. (Form a storage perspective each chunk is just a bunch of binary data - it is not obvious which chunks make up a specific file.)
Similar to the storage, the database only contains encrypted data. There is no way to reference database entries directly to files. Only the client with a valid link is able to connect all the dots and access the original file.

The following schema shows a simplified version of the implementation:

![Concept](https://sharrr.com/images/about/about-overview.jpg)

It is worth noting here that the alias and master key **never leave the browser**. Both strings will be added to the fragment identifier of the download link. This commonly referred to as the **#hash** or **anchor** part of the URL is never sent to the server. (You can check yourself in your browser's devtools: When you access a link, this information will not be sent as part of the request.)

#### Upload (Encryption)

Encrypting the file is the easier part: First, a file is split into smaller chunks. Those chunks then get encrypted separately and stored on S3. A reference to each chunk, together with a signature and a public key is afterwards stored into the database.

![Encryption](https://sharrr.com/images/about/about-encryption.jpg)

#### Download (Decryption)

The download and decryption is the tricky part. Not only do we need to make sure the client is allowed to request a certain file (solved with a cryptographic signature, see blue box), but also it is not possible to stream files directly into the download folder. We therefore need a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) in between. If you want to learn more about how this works, I recommend [this video](https://www.youtube.com/watch?v=SdePc87Ffik) or this [blog post](https://proton.me/blog/proton-drive-web-encryption-technique).

![Decryption](https://sharrr.com/images/about/about-decryption.jpg)

## Cryptography

For encryption/decryption only built-in browser APIs are used, namely the **Web Crypto API**. As a side effect, this app won't run in legacy browsers or with older node versions. The following algorithms are being used:

- [**AES-GCM** (Advanced Encryption Standard - Galois/Counter Mode)](https://en.wikipedia.org/wiki/Galois/Counter_Mode) for symmetric encryption: This is used for the master key that encrypts/decrypts all file chunks and the data stored in the database.
- [**ECDSA** (Elliptic Curve Digital Signature Algorithm)](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm) for asymmetric encryption: This is used to sign the file chunk keys in order make sure the later download request is allowed to access this specific chunk file.

## Resources

This project is heavily inspired by a great online community and amazing open-source projects:

- [hat.sh](https://hat.sh/) - A client-side file encryption project
- [Proton Drive security model explained](https://proton.me/blog/protondrive-security) (Blog)
- [Firefox Send](https://github.com/mozilla/send) (Archived Repo)
- [Thomas Konrad on end-to-end encryption](https://www.youtube.com/watch?v=SdePc87Ffik) (Video)
- [MDN Docs about Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
