import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { error, json } from '@sveltejs/kit'
import type { RequestEvent } from './$types'

import { PUBLIC_S3_BUCKET } from '$env/static/public'
import { getS3Client } from '$lib/s3'

export const GET = async ({ url }: RequestEvent) => {
  const Bucket = PUBLIC_S3_BUCKET

  const key: string | null = url.searchParams.get('file')

  if (!key) {
    return error(400, 'File parameter missing.')
  }

  const Conditions = [{ 'Content-Type': 'application/octet-stream' }]

  try {
    const post = await createPresignedPost(getS3Client(), {
      Bucket,
      Fields: {
        acl: 'bucket-owner-full-control',
        key: key
      },
      Key: key,
      Expires: 3 * 60 * 60, // seconds -> 3h (For really big files)
      Conditions
    })

    return json(post)
  } catch (err) {
    console.error(err)
    throw error(400, 'Something went wrong.')
  }
}
