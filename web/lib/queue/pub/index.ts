import { config } from '@/config'
import Redis from 'ioredis'

const redis = new Redis({
  host: config.redisHost,
  port: config.redisPort,
})

export const addMessageToQueue = async <T>(topic: string, message: T) => {
  const payload = JSON.stringify({ topic: topic, data: message })
  console.log({ redis })
  await redis.rpush(config.nextToPythonQueue, payload)
}
