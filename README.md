# sharrr

**One-time end-to-end encrypted file transfer.**

This project is a proof-of-concept on how to transfer files (of virtually unlimited size) asynchronously and in the most secure way possible.

Learn more about the [technical implementation](https://sharrr.com/about). See how [sharrr compares](https://github.com/stophecom/sharrr-svelte/blob/main/src/routes/about/comparison.md) to other services.

Live version: [www.sharrr.com](https://sharrr.com)

## Developing

```bash
# Initial installation
npm i

# Run dev server
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### DB

#### Prisma ORM

```bash
# Init primsa
npx prisma init

# Push schema to PlanetScale
npx prisma db push

# Open prisma studio locally
npx prisma studio

# After changes in DB are made. Should not be necessary.
# https://www.prisma.io/docs/concepts/components/prisma-client#4-evolving-your-application
npx prisma generate
```

#### PlanetScale

Using PlanetScale currently, but can be done with any Prisma compatible database.

```bash
# Authenticate PlanetScale
pscale auth login

# Connect to DB dev branch
# DATABASE_URL='mysql://root@127.0.0.1:3309/sharrr'
pscale connect sharrr dev --port 3309

```

### Tests

```bash
# Run unit tests with vitest
# Important: Node 19+ is required (Support for crypto modules)
npm run test:unit


# E2E tests with playwright
npm run test

```

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

### Maintenance

There is a Github workflow `cron-cleanup-files.yml` that runs every day to cleanup old files.
See `src/routes/api/v1/cron/+server.ts` for more info.

You can trigger the cron job locally with:

```bash
curl --request POST \
     --url 'http://localhost:3000/api/v1/cron' \
     --header 'Authorization: Bearer API_SECRET_KEY'

```

## Self hosting

### With Vercel & co.

You will need the following secrets.

```bash
# Prisma compatible DB e.g. Planetscale
DATABASE_URL='mysql://'

# S3 compatible object storage e.g. AWS
S3_ENDPOINT='<string>'
S3_ACCESS_KEY='<string>'
S3_SECRET_KEY='<string>'
PUBLIC_S3_BUCKET='<string>'

# Vercel specific, but can be easily replaced.
VERCEL_URL='http://localhost:3000'
PUBLIC_ENV='development' # preview/production

# Only used for cron jobs that run using Github Actions.
API_SECRET_KEY='<string>'
```

### With Docker

Coming soon

## About

### Stack

- SvelteKit
- Tailwind CSS
- PlanetScale (MySQL DB)
- Prisma (ORM)
- Doppler (For env handling)

### Infrastructure

- Website on [Vercel](https://vercel.com/)
- DB on [PlanetScale](https://planetscale.com/)
- S3 Object Storage with [flow.swiss](https://flow.swiss)

### License

[MIT](https://opensource.org/license/mit/) (Code)

[CC BY-NC-ND](https://creativecommons.org/licenses/by-nc-nd/4.0/) (Creatives)
