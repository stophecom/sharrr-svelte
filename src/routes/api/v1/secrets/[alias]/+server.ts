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
  return new Response(JSON.stringify(secret))
}
