import { VERCEL_URL } from '$env/static/private'
import type { PageServerLoad } from './$types'

const sanitizeUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`)

export const load = (() => {
  return {
    vercelUrl: sanitizeUrl(VERCEL_URL)
  }
}) satisfies PageServerLoad
