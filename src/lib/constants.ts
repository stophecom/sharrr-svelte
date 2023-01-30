import { PUBLIC_ENV } from '$env/static/public'

export const MB = 10 ** 6 // 1000000 Bytes = 1 MB.
export const GB = 10 ** 9 // 1000000000 Bytes = 1 GB.

export const MAX_FILE_SIZE = (PUBLIC_ENV === 'production' ? 100 : 1) * GB
export const CHUNK_SIZE = (PUBLIC_ENV === 'production' ? 100 : 1) * MB
