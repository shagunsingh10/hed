import { config } from '@/config'
import Redis from 'ioredis'

const connection = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  maxRetriesPerRequest: null,
})

export { connection }
