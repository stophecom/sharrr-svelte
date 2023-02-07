import { VERCEL_URL } from '$env/static/private'
import { PUBLIC_ENV } from '$env/static/public'
import type { PageServerLoad } from './$types'
import { productionDomain } from '$lib/constants'

const sanitizeUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`)

export const load = (() => {
  return {
    baseUrl: PUBLIC_ENV === 'production' ? productionDomain : sanitizeUrl(VERCEL_URL)
  }
}) satisfies PageServerLoad
