import { config } from '@/config'
import { connection as redis } from './connection'

const MAX_RETRIES = 3
const RETRY_INTERVAL_IN_MS = 100

export const sendMessageToPythonService = async (message: string) => {
  let retry = 0
  const queue = config.pythonConsumerQueue

  while (retry < MAX_RETRIES) {
    try {
      await redis.rpush(queue, message)
      return
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_IN_MS))
      console.log(e)
      retry += 1
    }
  }

  throw new Error('Failed to send message to redis')
}
