import { DeleteObjectsCommand, paginateListObjectsV2 } from '@aws-sdk/client-s3'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'

import { API_SECRET_KEY } from '$env/static/private'
import { PUBLIC_FLOW_S3_BUCKET } from '$env/static/public'
import { getS3Client } from '$lib/s3'
import { fileRetentionPeriodInDays } from '$lib/constants'

const BucketName = PUBLIC_FLOW_S3_BUCKET
const client = getS3Client()

type ObjectList = { Key: string }[]
export const POST: RequestHandler = async ({ request }) => {
  const authorization = request.headers.get('authorization')

  if (authorization === `Bearer ${API_SECRET_KEY}`) {
    // Delete files older than X days
    const deleteFilesBeforeDate = new Date()
    deleteFilesBeforeDate.setDate(deleteFilesBeforeDate.getDate() - fileRetentionPeriodInDays) // X days in the past

    for await (const data of paginateListObjectsV2(
      { client, pageSize: 1000 },
      { Bucket: BucketName }
    )) {
      if (!data.Contents) {
        throw error(500, 'No Contents')
      }

      // Filter files by retention threshold date
      // Using "as ObjectList" b/c https://www.karltarvas.com/2021/03/11/typescript-array-filter-boolean.html
      const s3ObjectsToDelete = data.Contents.map(({ Key, LastModified }) => {
        if (LastModified && LastModified < deleteFilesBeforeDate) {
          if (typeof Key === 'string') {
            return { Key }
          }
        }
      }).filter(Boolean) as ObjectList

      if (!s3ObjectsToDelete.length) {
        throw error(500, 'No files to delete')
      }

      const bucketParams = { Bucket: BucketName, Delete: { Objects: s3ObjectsToDelete } }
      await client.send(new DeleteObjectsCommand(bucketParams))
    }

    return json({ success: true })
  } else {
    throw error(401, 'Unauthorized')
  }
}
