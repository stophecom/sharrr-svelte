import type { Handle } from '@sveltejs/kit'
import { PUBLIC_ENV } from '$env/static/public'

export const handle = (async ({ event, resolve }) => {
  const response = await resolve(event)

  // The following doesn't work for some reason? Adding the tag manually for now. See layout.
  if (PUBLIC_ENV !== 'production') {
    response.headers.set('X-Robots-Tag', 'noindex')
  }

  return response
}) satisfies Handle
