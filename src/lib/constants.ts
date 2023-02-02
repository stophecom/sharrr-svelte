export const productionDomain = 'https://sharrr.com'
export const fileRetentionPeriodInDays = 7
export const MB = 10 ** 6 // 1000000 Bytes = 1 MB.
export const GB = 10 ** 9 // 1000000000 Bytes = 1 GB.

export const getMaxFileSize = (env: string) => (env === 'production' ? 100 : 1) * GB
export const getChunkSize = (env: string) => (env === 'production' ? 100 : 1) * MB
