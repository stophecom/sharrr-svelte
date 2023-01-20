declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      FLOW_S3_ENDPOINT: string
      FLOW_S3_ACCESS_KEY: string
      FLOW_S3_SECRET_KEY: string
      FLOW_S3_BUCKET: string
    }
  }
}
