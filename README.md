# sharrr

One-time end-to-end encrypted file transfer.

## Developing

```bash
# Initial installation
npm i

# Run dev server
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### DB (PlanetScale) & Prisma

```bash
# Authenticate PlanetScale
pscale auth login

# Connect to DB dev branch
# DATABASE_URL='mysql://root@127.0.0.1:3309/sharrr'
pscale connect sharrr dev --port 3309

# Init primsa
npx prisma init

# Push schema to PlanetScale
npx prisma db push

# Open prisma studio locally
npx prisma studio

# After changes in DB are made
# https://www.prisma.io/docs/concepts/components/prisma-client#4-evolving-your-application
npx prisma generate
```

### Tests

```bash
# Run unit tests with vitest
# Important: Node 19+ is required (Support for crypto modules)
npm run test:unit


# E2E tests with playwright
npm run test

```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## About

### Stack

- SvelteKit
- Tailwind CSS
- PlanetScale (MySQL DB)
- Prisma (ORM)
