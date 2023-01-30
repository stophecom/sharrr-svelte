This project is proof-of-concept on how to transmit large files over the internet in the most secure way possible: **End-to-end encrypted. One time.**

## Security

Main idea is that only the client is ever able to access the data in plain text (Build the file). Even if all other systems (API, DB, S3) would be compromised, it shouldn't be possible to access or reverse-engineer the original file. Apart from the end-to-end encryption, the file shall only be downloaded once within a defined period of time.

### Broad concept

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
