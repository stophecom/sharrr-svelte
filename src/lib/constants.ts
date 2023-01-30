import { VERCEL_ENV } from '$env/static/private'

export const MB = 10 ** 6 // 1000000 Bytes = 1 MB.
export const GB = 10 ** 9 // 1000000000 Bytes = 1 GB.

export const MAX_FILE_SIZE = 100 * GB
export const CHUNK_SIZE = (VERCEL_ENV === 'production' ? 100 : 1) * MB // @todo Increase when production ready
