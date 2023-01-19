import { error } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { Prisma } from '@prisma/client'

import prisma from '$lib/prisma'

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json()
    await prisma.secret.create({ data: body })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === 'P2002') {
        throw error(500, 'Alias need to be unique.')
      }
    }

    throw error(500, 'Error storing secret.')
  }

  return new Response(JSON.stringify({ message: 'File encrypted and saved.' }), {
    status: 200
  })
}
