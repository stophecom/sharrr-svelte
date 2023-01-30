export const MB = 10 ** 6 // 1000000 Bytes = 1 MB.
export const GB = 10 ** 9 // 1000000000 Bytes = 1 GB.

export const getMaxFileSize = (env) => (env === 'production' ? 100 : 1) * GB
export const getChunkSize = (env) => (env === 'production' ? 100 : 1) * MB
