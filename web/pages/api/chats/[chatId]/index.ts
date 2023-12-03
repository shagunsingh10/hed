import { getUserInfoFromSessionToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMessageToPythonService } from '@/lib/redis'
import type { ApiRes } from '@/types/api'
import { Message } from '@/types/chats'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Message[] | Message>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)
  const chatId = req.query.chatId as string

  switch (req.method) {
    case 'GET': {
      const messages = await prisma.message.findMany({
        where: {
          chatId: chatId,
        },
        orderBy: {
          timestamp: 'asc',
        },
        take: 100,
      })
      res.status(200).json({
        success: true,
        data: messages.map((e) => ({
          ...e,
          sources: e.sources as Record<string, any>[],
        })),
      })
      break
    }
    case 'POST': {
      const { content } = req.body
      const newMessage = await prisma.$transaction(async (tx) => {
        const [nm, chat] = await Promise.all([
          tx.message.create({
            data: {
              chatId: chatId,
              content: content,
              isResponse: false,
            },
          }),
          tx.chat.update({
            where: {
              id: chatId,
            },
            data: {
              lastMessageAt: new Date(),
            },
            select: {
              projectId: true,
            },
          }),
        ])

        // find all collections to get query context from
        let collections
        // if project specific chat, just read project specific collections
        if (chat?.projectId) {
          collections = await tx.knowledgeGroup.findMany({
            where: {
              projectId: chat.projectId,
              UserRole: {
                some: {
                  userId: user?.id,
                },
              },
            },
            select: {
              id: true,
            },
          })
        } else {
          // else, read all collections
          collections = await tx.knowledgeGroup.findMany({
            where: {
              UserRole: {
                some: {
                  userId: user?.id,
                },
              },
            },
            select: {
              id: true,
            },
          })
        }

        // send qury and collection name to query processing engine
        await sendMessageToPythonService(
          JSON.stringify({
            job_type: 'query',
            payload: {
              query: content,
              collections: collections.map((e) => e.id),
              chat_id: chatId,
              user: user?.email,
            },
          })
        )
        return nm
      })

      res.status(201).json({
        success: true,
        data: {
          ...newMessage,
          sources: newMessage.sources as Record<string, any>[],
        },
      })
      break
    }
    default: {
      res.status(405).json({
        success: true,
        error: 'Method not allowed',
      })
      break
    }
  }
}

export default handler
