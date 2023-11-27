import { getUserInfoFromSessionToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { ChatWithoutMessage } from '@/types/chats'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<ChatWithoutMessage | ChatWithoutMessage[]>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)
  const projectId = req.query.projectId as string | null

  switch (req.method) {
    case 'GET': {
      const chats = await prisma.chat.findMany({
        where: {
          userId: user?.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      res.status(200).json({
        success: true,
        data: chats,
      })
      break
    }
    case 'POST': {
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
