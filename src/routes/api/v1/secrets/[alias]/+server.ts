import { error } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'

import prisma from '$lib/prisma'

export const GET: RequestHandler = async ({ params }) => {
  const alias = params.alias

  if (!alias) {
    throw error(400, 'No alias provided.')
  }

  try {
    const secret = await prisma.secret.findUnique({ where: { alias: alias } })
    return new Response(JSON.stringify(secret))
  } catch (e) {
    throw error(500, 'Error fetching secret.')
  }
}
