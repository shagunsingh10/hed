import { config } from '@/config'
import Redis from 'ioredis'

const redis = new Redis({
  host: config.redisHost,
  port: config.redisPort,
})

export const addMessageToQueue = async <T>(
  queue: string,
  topic: string,
  message: T
) => {
  const payload = JSON.stringify({ topic: topic, data: message })
  await redis.rpush(queue, payload)
}
