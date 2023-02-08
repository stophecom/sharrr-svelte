import type { Handle } from '@sveltejs/kit'
import { PUBLIC_ENV } from '$env/static/public'

export const handle = (async ({ event, resolve }) => {
  const response = await resolve(event)

  if (PUBLIC_ENV !== 'production') {
    response.headers.set('X-Robots-Tag', 'noindex')
  }

  return response
}) satisfies Handle
