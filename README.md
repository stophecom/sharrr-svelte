# sharrr

One-time end-to-end encrypted file transfer.

Live version: [sharrr.com](https://sharrr.com)

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

## Maintenance

### Cron jobs

There is a Github workflow `cron-cleanup-files.yml` that runs every day to cleanup old files.
See `src/routes/api/v1/cron/+server.ts` for more info.

You can trigger the cron job locally with:

```bash
curl --request POST \
     --url 'http://localhost:3000/api/v1/cron' \
     --header 'Authorization: Bearer API_SECRET_KEY'

```

## About

More info about the project and the technical implementation is [documented here](https://sharrr.com/about).

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

This project is licensed under the terms of the MIT license.
