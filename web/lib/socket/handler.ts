import redis from '@/lib/redis/client'

const MAX_RETRIES = 3
const RETRY_INTERVAL_IN_MS = 100
const REDIS_SOCKET_CLIENT = 'redis_socket_client'

export const saveSocketClientId = async (userId: string, clientId: string) => {
  let retry = 0
  while (retry < MAX_RETRIES) {
    try {
      await redis.set(`${REDIS_SOCKET_CLIENT}_${userId}`, clientId)
      return
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_IN_MS))
      console.log(e)
      retry += 1
    }
  }

  throw new Error('Failed to send message to redis')
}

export const removeSocketClientId = async (userId: string) => {
  let retry = 0
  while (retry < MAX_RETRIES) {
    try {
      await redis.del(`${REDIS_SOCKET_CLIENT}_${userId}`)
      return
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_IN_MS))
      console.log(e)
      retry += 1
    }
  }

  throw new Error('Failed to send message to redis')
}

export const getSocketClientId = async (userId: string) => {
  let retry = 0
  while (retry < MAX_RETRIES) {
    try {
      return await redis.get(`${REDIS_SOCKET_CLIENT}_${userId}`)
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_IN_MS))
      console.log(e)
      retry += 1
    }
  }

  throw new Error('Failed to send message to redis')
}
