import { config } from '@/config'
import Redis from 'ioredis'
import { type Server } from 'socket.io'

const redis = new Redis({
  host: config.redisHost,
  port: config.redisPort,
})

/* Use db-2 for storing socket details */
redis.select(2)

const SOCKET_KEY = 'SOCKET_KEY:'

export const saveSocketClientId = async (userId: string, clientId: string) => {
  await redis.set(`${SOCKET_KEY}${userId}`, clientId, 'EX', 60 * 60 * 24)
}

export const removeSocketClientId = async (userId: string) => {
  await redis.del(`${SOCKET_KEY}${userId}`)
}

export const getSocketClientId = async (userId: string) => {
  return await redis.get(`${SOCKET_KEY}${userId}`)
}

export const emitSocketEventToUser = async <T>(
  io: Server,
  to_user: string,
  event: string,
  payload: T
) => {
  const socketId = await getSocketClientId(to_user)
  if (socketId) io.to(socketId).emit(event, payload)
}
