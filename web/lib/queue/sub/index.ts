import { config } from '@/config'
import {
  handleAssetStatus,
  handleChatResponse,
  handleDocStatus,
} from '@/lib/queue/sub/handlers'
import Redis from 'ioredis'
import { ASSET_INGESTION_STATUS, DOC_STATUS, QUERY_RESPONSE } from './topics'

type ITopicCallbacks = Record<string, (message: string) => Promise<void>>

const redis = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  maxRetriesPerRequest: null,
})

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

const topicsHandlers = {
  [DOC_STATUS]: handleDocStatus,
  [ASSET_INGESTION_STATUS]: handleAssetStatus,
  [QUERY_RESPONSE]: handleChatResponse,
}

processMessageFromQueue(topicsHandlers)
