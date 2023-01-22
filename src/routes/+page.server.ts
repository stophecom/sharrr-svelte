import { VERCEL_URL } from '$env/static/private'
import type { PageServerLoad } from './$types'

export const load = (() => {
  return {
    vercelUrl: VERCEL_URL
  }
}) satisfies PageServerLoad
