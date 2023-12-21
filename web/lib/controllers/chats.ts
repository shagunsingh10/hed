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
        messages: {
          create: {
            content: content,
            isResponse: false,
          },
        },
      },
      select: {
        project: {
          select: {
            assets: {
              select: {
                id: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    })

    // if project specific chat, just read project specific collections else, read all collections
    let assetIds
    if (nm.project) {
      assetIds = nm.project.assets.map((e) => e.id)
    } else {
      assetIds = await tx.assetMemberRole.findMany({
        where: {
          userId: user?.id,
        },
        select: {
          assetId: true,
        },
      })
      assetIds = assetIds.map((e) => e.assetId)
    }

    // send query to query processing engine
    await enqueueQueryJob({
      query: content,
      asset_ids: assetIds,
      chat_id: chatId,
      user: user?.email as string,
    })
    return nm
  })

  res.status(201).json({
    success: true,
    data: {
      ...newMessage.messages[0],
      sources: [],
    },
  })
}
