import { config } from '@/config'
import * as Minio from 'minio'

const minioClient = new Minio.Client({
  endPoint: config.s3Endpoint,
  port: Number(config.s3Port),
  useSSL: false,
  accessKey: config.s3AccessKey,
  secretKey: config.s3SecretKey,
})

export default minioClient
