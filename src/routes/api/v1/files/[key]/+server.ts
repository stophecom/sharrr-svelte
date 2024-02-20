import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { json, error } from '@sveltejs/kit'
import type { RequestEvent } from './$types'

import { verifyMessageSignature, importPublicKey } from '$lib/crypto'
import { getS3Client } from '$lib/s3'

import prisma from '$lib/prisma'

export const POST = async ({ params, request }: RequestEvent) => {
  const body = await request.json()
  const { alias, bucket, keyHash, signature } = body

  const Bucket = bucket
  const Key = keyHash

  // const resourceAccessToken = request.headers['X-Sharrr-Access-Token']

  if (!Key) {
    error(400, 'No file key provided.');
  }

  const secret = await prisma.secret.findUnique({ where: { alias: alias } })

  if (!secret) {
    error(400, `No database entry for alias ${alias}.`);
  }

  // Here we check if the requested file belongs to the "owner" via signature.
  const publicKey = await importPublicKey(secret.publicKey)
  if (!publicKey) {
    error(400, `Public key missing or invalid.`);
  }
  const isSignatureValid = verifyMessageSignature(params.key, signature, publicKey)
  if (!isSignatureValid) {
    error(400, `Invalid signature`);
  }

  const bucketParams = {
    Bucket,
    Key,
    ACL: 'public-read'
  }
  const url = await getSignedUrl(getS3Client(), new GetObjectCommand(bucketParams), {
    expiresIn: 5 * 60 // 5min
  })

  if (!url) {
    error(400, `Couldn't get signed url. File no longer exist.`);
  }

  return json({ url })
}
