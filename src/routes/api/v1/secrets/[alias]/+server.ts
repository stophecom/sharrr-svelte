import { error } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'

import prisma from '$lib/prisma'

export const GET: RequestHandler = async ({ params }) => {
  const alias = params.alias

  if (!alias) {
    throw error(400, 'No alias provided.')
  }

  const secret = await prisma.secret.findUnique({ where: { alias: alias } })

  if (!secret) {
    throw error(400, `No secret for alias ${alias}.`)
  }

  if (secret?.retrievedAt) {
    throw error(410, {
      message: `This link has already been accessed - the file no longer exists.`
    })
  }

  return new Response(JSON.stringify({ fileMeta: secret.fileMeta }))
}

export const DELETE: RequestHandler = async ({ params }) => {
  const alias = params.alias

  if (!alias) {
    throw error(400, 'No alias provided.')
  }

  const secret = await prisma.secret.findUnique({ where: { alias: alias } })

  if (!secret) {
    throw error(400, `No secret for alias ${alias}.`)
  }

  if (!secret?.retrievedAt) {
    await prisma.secret.update({
      where: { alias: alias },
      data: {
        retrievedAt: new Date()
      }
    })
  } else {
    throw error(410, {
      message: `This link has already been accessed - the file no longer exists.`
    })
  }

  return new Response(JSON.stringify({ fileReference: secret.fileReference }))
}
