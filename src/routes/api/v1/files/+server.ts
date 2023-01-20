import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

import { PUBLIC_FLOW_S3_BUCKET } from '$env/static/public'
import { getS3Client } from '$lib/s3'
import { json } from '@sveltejs/kit'

const MB = 10 ** 6 // 1000000 Bytes = 1 MB.

const maxFileSize = 100 * MB

export const GET: RequestHandler = async ({ url }) => {
  const Bucket = PUBLIC_FLOW_S3_BUCKET

  const Key: string = url.searchParams.get('file')
  const Conditions = [
    ['content-length-range', 0, maxFileSize],
    { 'Content-Type': 'application/octet-stream' }
  ]

  try {
    const post = await createPresignedPost(getS3Client(), {
      Bucket,
      Fields: {
        acl: 'bucket-owner-full-control',
        key: Key
      },
      Key,
      Expires: 60, // seconds
      Conditions
    })
    return json(post)
  } catch (error) {
    console.error(error)
  }
}

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const s3Client = getS3Client()
    const bucketParams = {
      Bucket: request.query.bucket as string,
      Key: request.query.file as string,
      ACL: 'public-read'
    }

    const url = await getSignedUrl(s3Client, new GetObjectCommand(bucketParams), {
      expiresIn: 60
    })

    if (!url) {
      throw createError(405, `Couldn't get signed url. File no longer exist.`)
    }

    return new Response(JSON.stringify(url), {
      status: 200
    })

    // After the file has been retrieved we delete.
    const deletionTimeout = 10 * 60 * 1000 // 10 Minutes
    setTimeout(
      async () => await s3Client.send(new DeleteObjectCommand(bucketParams)),
      deletionTimeout
    )
  } catch (error) {
    console.error(error)
  }
}
