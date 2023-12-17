import { config } from '@/config'
import { connection as redis } from '@/lib/redis'

type ITopicCallbacks = Record<string, (message: string) => Promise<void>>

export const addMessageToQueue = async <T>(topic: string, message: T) => {
  const payload = JSON.stringify({ topic: topic, data: message })
  await redis.rpush(config.nextToPythonQueue, payload)
}

export const processMessageFromQueue = async (topics: ITopicCallbacks) => {
  console.log(`Registered topics -> ${Object.keys(topics)}`)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await redis.blpop(config.pythonToNextQueue, 1)

    if (result) {
      const message = JSON.parse(result[1])
      const callback = topics[message.topic]
      if (callback) {
        await callback(message.data)
      }
    }
  }
}
