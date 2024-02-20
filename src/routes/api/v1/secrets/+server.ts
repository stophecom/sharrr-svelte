import { error } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { Prisma } from '@prisma/client'

import prisma from '$lib/prisma'

type SecretsRequest = {
  alias: string
  publicKey: string
  fileMeta: string
  fileReference: string
  fileSize: number
}
export type SecretsResponse = {
  message: string
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body: SecretsRequest = await request.json()
    const { alias, publicKey, fileReference, fileMeta, fileSize } = body
    await prisma.secret.create({ data: { alias, publicKey, fileMeta, fileReference } })

    // Here we update stats. This is non-critical, therefore we catch potential errors.
    try {
      await prisma.stats.update({
        where: { id: 1 },
        data: {
          totalFilesUploaded: { increment: 1 },
          totalBytesUploaded: { increment: fileSize }
        }
      })
    } catch (error) {
      console.error(`Couldn't update stats.`, error)
    }
  } catch (e) {
    console.error(e)
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === 'P2002') {
        error(500, 'Alias need to be unique.');
      }
    }

    error(500, 'Error storing secret.');
  }

  return new Response(JSON.stringify({ message: 'File encrypted and saved.' }), {
    status: 200
  })
}
