import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { json, error } from '@sveltejs/kit'
import type { RequestEvent } from './$types'

import { PUBLIC_FLOW_S3_BUCKET } from '$env/static/public'
import { getS3Client } from '$lib/s3'

export const GET = async ({ params }: RequestEvent) => {
  const Bucket = PUBLIC_FLOW_S3_BUCKET
  const Key = params.key

  if (!Key) {
    throw error(400, 'No file key provided.')
  }

  try {
    const bucketParams = {
      Bucket,
      Key,
      ACL: 'public-read'
    }

    const url = await getSignedUrl(getS3Client(), new GetObjectCommand(bucketParams), {
      expiresIn: 60
    })

    if (!url) {
      throw error(405, `Couldn't get signed url. File no longer exist.`)
    }

    return json({ url })

    // After the file has been retrieved we delete.
    // const deletionTimeout = 10 * 60 * 1000 // 10 Minutes
    // setTimeout(
    //   async () => await s3Client.send(new DeleteObjectCommand(bucketParams)),
    //   deletionTimeout
    // )
  } catch (e) {
    console.error(e)
    throw error(405, `Couldn't get signed url.`)
  }
}
