import { getUserInfoFromSessionToken } from '@/lib/middlewares/auth'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import type { ChatWithoutMessage, Message } from '@/types/chats'
import { NextApiRequest, NextApiResponse } from 'next'
import { enqueueQueryJob } from '../queue/pub/events'

export const getAllChats = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<ChatWithoutMessage[]>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)
  const chats = await prisma.chat.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
  })
  res.status(200).json({
    success: true,
    data: chats,
  })
}

export const addNewChat = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<ChatWithoutMessage>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)
  const projectId = req.query.projectId as string | null
  const title = req.body.title

  const newChat = await prisma.chat.create({
    data: {
      userId: Number(user?.id),
      projectId: projectId,
      title: title || 'No Title',
    },
  })

  res.status(201).json({
    success: true,
    data: newChat,
  })
}

export const getMessagesByChatId = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Message[]>>
) => {
  const chatId = req.query.chatId as string
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
      sources: e.sources as Record<string, unknown>[],
    })),
  })
}

export const postQuery = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Message>>
) => {
  const chatId = req.query.chatId as string
  const { content } = req.body
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  const newMessage = await prisma.$transaction(async (tx) => {
    const nm = await tx.chat.update({
      where: {
        id: chatId,
      },
      data: {
        lastMessageAt: new Date(),
        Message: {
          create: {
            content: content,
            isResponse: false,
          },
        },
      },
      select: {
        Project: {
          select: {
            knowledgeGroups: {
              select: {
                id: true,
              },
            },
          },
        },
        Message: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    })

    // if project specific chat, just read project specific collections else, read all collections
    let collections
    if (nm.Project) {
      collections = nm.Project.knowledgeGroups
    } else {
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

    // send query to query processing engine
    await enqueueQueryJob({
      query: content,
      collections: collections.map((e) => e.id),
      chat_id: chatId,
      user: user?.email as string,
    })
    return nm
  })

  res.status(201).json({
    success: true,
    data: {
      ...newMessage.Message[0],
      sources: [],
    },
  })
}
