import { config as appConfig } from '@/config'
import { prisma } from '@/lib/prisma'
import { getSocketClientId } from '@/lib/socket/handler'
import type { ApiRes } from '@/types/api'
import { NextApiRequest } from 'next'
import type { NextApiResponseWithSocket } from '../socket'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponseWithSocket<ApiRes<string>>
) => {
  switch (req.method) {
    case 'PUT': {
      const chatId = req.body.chatId as string
      const apiKey = req.body.apiKey as string
      const user = req.body.user as string
      const complete = req.body.complete as string
      const chunk = req.body.chunk as string

      if (apiKey != appConfig.serviceApiKey) {
        return res.status(401).json({ success: false })
      }

      if (!complete) {
        // send response to user via socket
        const io = res.socket.server.io
        if (user && io) {
          getSocketClientId(user).then((socketId) => {
            if (socketId)
              io.to(socketId).emit('chat-response', {
                chatId: chatId,
                response: chunk,
                complete: false,
              })
          })
        }
      } else {
        const message = await prisma.message.create({
          data: {
            chatId: chatId,
            content: chunk,
            isResponse: true,
          },
        })
        const io = res.socket.server.io
        if (user && io) {
          getSocketClientId(user).then((socketId) => {
            if (socketId)
              io.to(socketId).emit('chat-response', {
                chatId: chatId,
                response: chunk,
                messageId: message.id,
                timestamp: message.timestamp,
                complete: true,
              })
          })
        }
      }

      res.status(201).json({
        success: true,
        data: '',
      })
      break
    }
    default:
      res.status(405).json({
        success: true,
        error: 'Method not allowed',
      })
      break
  }
}

export default handler
